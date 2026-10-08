package com.campus.lostfound.claim.service;

import com.campus.lostfound.claim.client.ItemClient;
import com.campus.lostfound.claim.dto.*;
import com.campus.lostfound.claim.entity.Claim;
import com.campus.lostfound.claim.entity.ClaimStatus;
import com.campus.lostfound.claim.exception.BadRequestException;
import com.campus.lostfound.claim.exception.ResourceNotFoundException;
import com.campus.lostfound.claim.repository.ClaimRepository;
import com.campus.lostfound.claim.security.UserPrincipal;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private static final Logger log = LoggerFactory.getLogger(ClaimService.class);

    private final ClaimRepository claimRepository;
    private final ItemClient itemClient;
    private final com.campus.lostfound.claim.client.NotificationClient notificationClient;

    public ClaimService(ClaimRepository claimRepository,
                        ItemClient itemClient,
                        com.campus.lostfound.claim.client.NotificationClient notificationClient) {
        this.claimRepository = claimRepository;
        this.itemClient = itemClient;
        this.notificationClient = notificationClient;
    }

    /**
     * Submit a new ownership claim for an item.
     * Enforces all 5 validation rules specified in requirements.
     */
    @Transactional
    public ClaimResponse submitClaim(CreateClaimRequest request, UserPrincipal principal) {
        Long claimantUserId = principal.getId();

        // Rule 1: Verify item exists in Item Service via OpenFeign
        ItemDto item = fetchItemOrThrow(request.getItemId());

        // Rule 2: Verify item is valid for claiming (cannot claim already RETURNED item)
        if ("RETURNED".equalsIgnoreCase(item.getStatus())) {
            throw new BadRequestException("Item #" + item.getId() + " has already been returned and is no longer available for claims");
        }

        // Rule 3: Do not allow user to claim an item that they reported themselves
        if (Objects.equals(item.getUserId(), claimantUserId)) {
            throw new BadRequestException("You cannot claim an item that you reported yourself");
        }

        // Rule 4: Prevent duplicate pending claims from the same user for the same item
        if (claimRepository.existsByItemIdAndClaimantUserIdAndStatus(item.getId(), claimantUserId, ClaimStatus.PENDING)) {
            throw new BadRequestException("You already have a pending claim for this item");
        }

        // Rule 5: Ownership details validated via Jakarta Validation annotations

        Claim claim = new Claim();
        claim.setItemId(item.getId());
        claim.setItemName(item.getName() != null ? item.getName() : "Item #" + item.getId());
        claim.setClaimantUserId(claimantUserId);
        claim.setClaimantName(principal.getName() != null ? principal.getName() : "Campus Student");
        claim.setClaimantEmail(principal.getEmail());
        claim.setOwnershipDescription(request.getOwnershipDescription().trim());
        claim.setProofDetails(request.getProofDetails() != null ? request.getProofDetails().trim() : null);
        claim.setStatus(ClaimStatus.PENDING);

        Claim saved = claimRepository.save(claim);

        // Update item status in Item Service to CLAIMED via OpenFeign
        try {
            itemClient.updateItemStatus(item.getId(), new StatusUpdateRequest("CLAIMED", "Claim #" + saved.getId() + " submitted"));
        } catch (Exception e) {
            log.warn("Could not update item status to CLAIMED via Feign for item {}: {}", item.getId(), e.getMessage());
        }

        // Notify item reporter about the new claim
        if (item.getUserId() != null) {
            try {
                notificationClient.createNotification(new NotificationRequest(
                        item.getUserId(),
                        "A claim has been submitted for your reported item: " + item.getName(),
                        "CLAIM_SUBMITTED",
                        saved.getId()
                ));
            } catch (Exception e) {
                log.warn("Could not send CLAIM_SUBMITTED notification for item {}: {}", item.getId(), e.getMessage());
            }
        }

        return mapToResponse(saved);
    }

    /**
     * Get claims submitted by the currently authenticated student.
     */
    public List<ClaimResponse> getMyClaims(Long userId) {
        return claimRepository.findByClaimantUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get claim details by ID with strict ownership validation:
     * Student can only view their own claim; Admin can view any claim.
     */
    public ClaimResponse getClaimById(Long id, UserPrincipal principal) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (!principal.isAdmin() && !Objects.equals(claim.getClaimantUserId(), principal.getId())) {
            throw new AccessDeniedException("You are not authorized to view another student's claim details");
        }

        return mapToResponse(claim);
    }

    /**
     * Admin: View all claims with optional status filter.
     */
    public List<ClaimResponse> getAllClaims(ClaimStatus status) {
        List<Claim> claims = (status != null)
                ? claimRepository.findByStatusOrderByCreatedAtDesc(status)
                : claimRepository.findAllByOrderByCreatedAtDesc();

        return claims.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin: Approve a claim.
     * Updates claim status to APPROVED, updates item status to RETURNED in Item Service,
     * and automatically rejects other competing pending claims for the same item.
     */
    @Transactional
    public ClaimResponse approveClaim(Long id, ReviewClaimRequest request) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (claim.getStatus() == ClaimStatus.APPROVED) {
            throw new BadRequestException("Claim #" + id + " is already approved");
        }
        if (claim.getStatus() == ClaimStatus.REJECTED) {
            throw new BadRequestException("Claim #" + id + " has already been rejected and cannot be approved");
        }

        claim.setStatus(ClaimStatus.APPROVED);
        String comment = (request != null && request.getAdminComment() != null && !request.getAdminComment().isBlank())
                ? request.getAdminComment().trim()
                : "Ownership details verified and approved.";
        claim.setAdminComment(comment);

        Claim saved = claimRepository.save(claim);

        // Update item status to RETURNED via OpenFeign
        try {
            itemClient.updateItemStatus(saved.getItemId(), new StatusUpdateRequest("RETURNED", "Claim #" + saved.getId() + " approved by admin"));
        } catch (Exception e) {
            log.warn("Could not update item status to RETURNED via Feign for item {}: {}", saved.getItemId(), e.getMessage());
        }

        // Notify claimant of approval
        try {
            notificationClient.createNotification(new NotificationRequest(
                    saved.getClaimantUserId(),
                    "Your claim for '" + saved.getItemName() + "' has been approved! The item is ready for handover.",
                    "CLAIM_APPROVED",
                    saved.getId()
            ));
        } catch (Exception e) {
            log.warn("Could not send CLAIM_APPROVED notification for claim {}: {}", saved.getId(), e.getMessage());
        }

        // Notify finder/reporter that the item was returned
        try {
            ItemDto item = fetchItemOrThrow(saved.getItemId());
            if (item != null && item.getUserId() != null && !item.getUserId().equals(saved.getClaimantUserId())) {
                notificationClient.createNotification(new NotificationRequest(
                        item.getUserId(),
                        "Your reported item '" + item.getName() + "' has been verified and returned to its owner.",
                        "ITEM_RETURNED",
                        saved.getId()
                ));
            }
        } catch (Exception e) {
            log.warn("Could not send ITEM_RETURNED notification for item {}: {}", saved.getItemId(), e.getMessage());
        }

        // Automatically reject any other pending claims for this item
        List<Claim> competingClaims = claimRepository.findByItemIdAndStatus(saved.getItemId(), ClaimStatus.PENDING);
        for (Claim competing : competingClaims) {
            if (!Objects.equals(competing.getId(), saved.getId())) {
                competing.setStatus(ClaimStatus.REJECTED);
                competing.setAdminComment("Item has been returned to another verified claimant.");
                claimRepository.save(competing);
                try {
                    notificationClient.createNotification(new NotificationRequest(
                            competing.getClaimantUserId(),
                            "Your claim for '" + competing.getItemName() + "' was rejected because the item was returned to another verified claimant.",
                            "CLAIM_REJECTED",
                            competing.getId()
                    ));
                } catch (Exception e) {
                    log.warn("Could not send competing CLAIM_REJECTED notification for claim {}: {}", competing.getId(), e.getMessage());
                }
            }
        }

        return mapToResponse(saved);
    }

    /**
     * Admin: Reject a claim.
     * Updates claim status to REJECTED, and reverts item status in Item Service to MATCHED if no other pending claims.
     */
    @Transactional
    public ClaimResponse rejectClaim(Long id, ReviewClaimRequest request) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (claim.getStatus() == ClaimStatus.APPROVED) {
            throw new BadRequestException("Claim #" + id + " is already approved and cannot be rejected");
        }
        if (claim.getStatus() == ClaimStatus.REJECTED) {
            throw new BadRequestException("Claim #" + id + " is already rejected");
        }

        claim.setStatus(ClaimStatus.REJECTED);
        String reason = (request != null && request.getAdminComment() != null && !request.getAdminComment().isBlank())
                ? request.getAdminComment().trim()
                : "Ownership details could not be verified.";
        claim.setAdminComment(reason);

        Claim saved = claimRepository.save(claim);

        // Notify claimant of rejection
        try {
            notificationClient.createNotification(new NotificationRequest(
                    saved.getClaimantUserId(),
                    "Your claim for '" + saved.getItemName() + "' was rejected. Reason: " + saved.getAdminComment(),
                    "CLAIM_REJECTED",
                    saved.getId()
            ));
        } catch (Exception e) {
            log.warn("Could not send CLAIM_REJECTED notification for claim {}: {}", saved.getId(), e.getMessage());
        }

        // Check if there are other pending claims for this item
        List<Claim> remainingPending = claimRepository.findByItemIdAndStatus(saved.getItemId(), ClaimStatus.PENDING);
        if (remainingPending.isEmpty()) {
            // Revert item status to MATCHED in Item Service
            try {
                itemClient.updateItemStatus(saved.getItemId(), new StatusUpdateRequest("MATCHED", "Claim #" + saved.getId() + " rejected"));
            } catch (Exception e) {
                log.warn("Could not revert item status via Feign for item {}: {}", saved.getItemId(), e.getMessage());
            }
        }

        return mapToResponse(saved);
    }

    public long countPending() {
        return claimRepository.countByStatus(ClaimStatus.PENDING);
    }

    private ItemDto fetchItemOrThrow(Long itemId) {
        try {
            ApiResponse<ItemDto> resp = itemClient.getItemById(itemId);
            if (resp == null || resp.getData() == null) {
                throw new ResourceNotFoundException("Item not found with id: " + itemId);
            }
            return resp.getData();
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("Item not found with id: " + itemId);
        } catch (FeignException e) {
            log.error("Feign communication failure with Item Service for item {}: {}", itemId, e.getMessage());
            throw new BadRequestException("Unable to verify item with Item Service: " + e.getMessage());
        }
    }

    private ClaimResponse mapToResponse(Claim c) {
        ClaimResponse res = new ClaimResponse();
        res.setId(c.getId());
        res.setItemId(c.getItemId());
        res.setItemName(c.getItemName());
        res.setClaimantUserId(c.getClaimantUserId());
        res.setClaimantName(c.getClaimantName());
        res.setClaimantEmail(c.getClaimantEmail());
        res.setClaimantPhone(c.getClaimantPhone());
        res.setOwnershipDescription(c.getOwnershipDescription());
        res.setProofDetails(c.getProofDetails());
        res.setStatus(c.getStatus());
        res.setAdminComment(c.getAdminComment());
        res.setCreatedAt(c.getCreatedAt());
        res.setUpdatedAt(c.getUpdatedAt());
        return res;
    }
}