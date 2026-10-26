package com.campus.lostfound.claim.service;

import com.campus.lostfound.claim.client.ItemClient;
import com.campus.lostfound.claim.client.NotificationClient;
import com.campus.lostfound.claim.dto.*;
import com.campus.lostfound.claim.entity.Claim;
import com.campus.lostfound.claim.entity.ClaimStatus;
import com.campus.lostfound.claim.exception.BadRequestException;
import com.campus.lostfound.claim.exception.ResourceNotFoundException;
import com.campus.lostfound.claim.repository.ClaimRepository;
import com.campus.lostfound.claim.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private static final Logger log = LoggerFactory.getLogger(ClaimService.class);

    private final ClaimRepository claimRepository;
    private final ItemClient itemClient;
    private final NotificationClient notificationClient;

    public ClaimService(ClaimRepository claimRepository,
                        ItemClient itemClient,
                        NotificationClient notificationClient) {
        this.claimRepository = claimRepository;
        this.itemClient = itemClient;
        this.notificationClient = notificationClient;
    }

    // ─────────────────────────────────────────────────────────
    // STUDENT: Submit a new claim
    // ─────────────────────────────────────────────────────────

    @Transactional
    public ClaimResponse submitClaim(CreateClaimRequest request, UserPrincipal principal) {
        Long claimantUserId = principal.getId();

        // Verify item exists
        ItemDto item = fetchItemOrThrow(request.getItemId());

        // Cannot claim an already returned item
        if ("RETURNED".equalsIgnoreCase(item.getStatus())) {
            throw new BadRequestException("Item #" + item.getId() + " has already been returned and is no longer available for claims");
        }

        // Cannot claim your own reported item
        if (Objects.equals(item.getUserId(), claimantUserId)) {
            throw new BadRequestException("You cannot claim an item that you reported yourself");
        }

        // Prevent duplicate pending claims
        if (claimRepository.existsByItemIdAndClaimantUserIdAndStatus(item.getId(), claimantUserId, ClaimStatus.PENDING)) {
            throw new BadRequestException("You already have a pending claim for this item");
        }

        Claim claim = new Claim();
        claim.setItemId(item.getId());
        claim.setItemName(item.getName() != null ? item.getName() : "Item #" + item.getId());
        claim.setClaimantUserId(claimantUserId);
        claim.setClaimantName(principal.getName() != null ? principal.getName() : "Campus Student");
        claim.setClaimantEmail(principal.getEmail());
        claim.setOwnershipDescription(request.getOwnershipDescription().trim());
        claim.setProofDetails(request.getProofDetails() != null ? request.getProofDetails().trim() : null);
        claim.setProofFileUrl(request.getProofFileUrl());
        claim.setStatus(ClaimStatus.PENDING);

        Claim saved = claimRepository.save(claim);
        log.info("Claim submitted: claimId={}, itemId={}, claimant={}", saved.getId(), item.getId(), principal.getName());

        // Update item status to CLAIMED
        try {
            itemClient.updateItemStatus(item.getId(), new StatusUpdateRequest("CLAIMED", "Claim #" + saved.getId() + " submitted"));
        } catch (Exception e) {
            log.warn("Could not update item status to CLAIMED for item {}: {}", item.getId(), e.getMessage());
        }

        // Notify item reporter
        if (item.getUserId() != null) {
            sendNotification(item.getUserId(),
                "A claim has been submitted for your reported item: " + item.getName(),
                "CLAIM_SUBMITTED", saved.getId());
        }

        return mapToResponse(saved, false);
    }

    // ─────────────────────────────────────────────────────────
    // STUDENT: Get own claims
    // ─────────────────────────────────────────────────────────

    public List<ClaimResponse> getMyClaims(Long userId) {
        return claimRepository.findByClaimantUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(c -> {
                    ClaimResponse res = mapToResponse(c, false);
                    try {
                        ApiResponse<ItemDto> itemRes = itemClient.getItemById(c.getItemId());
                        if (itemRes != null && itemRes.getData() != null) {
                            res.setHighValue(itemRes.getData().isHighValue());
                        }
                    } catch (Exception ignored) {}
                    return res;
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // STUDENT or ADMIN: Get claim by ID (ownership check)
    // ─────────────────────────────────────────────────────────

    public ClaimResponse getClaimById(Long id, UserPrincipal principal) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        boolean isAdmin = principal.isAdmin();

        if (!isAdmin && !Objects.equals(claim.getClaimantUserId(), principal.getId())) {
            throw new AccessDeniedException("You are not authorized to view another student's claim details");
        }

        ClaimResponse response = mapToResponse(claim, isAdmin);

        // If admin, also fetch private item details from item-service admin endpoint
        if (isAdmin) {
            try {
                ApiResponse<ItemDto> adminItemResponse = itemClient.getItemByIdAdmin(claim.getItemId());
                if (adminItemResponse != null && adminItemResponse.getData() != null) {
                    ItemDto adminItem = adminItemResponse.getData();
                    response.setHighValue(adminItem.isHighValue());
                    response.setPrivateItemDetails(adminItem.getPrivateDetails());
                }
            } catch (Exception e) {
                log.warn("Could not fetch admin item details for item {}: {}", claim.getItemId(), e.getMessage());
            }
        }

        return response;
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN: Get all claims with optional status filter
    // ─────────────────────────────────────────────────────────

    public List<ClaimResponse> getAllClaims(ClaimStatus status) {
        List<Claim> claims = (status != null)
                ? claimRepository.findByStatusOrderByCreatedAtDesc(status)
                : claimRepository.findAllByOrderByCreatedAtDesc();

        return claims.stream()
                .map(c -> {
                    ClaimResponse res = mapToResponse(c, true);
                    try {
                        ApiResponse<ItemDto> adminItem = itemClient.getItemByIdAdmin(c.getItemId());
                        if (adminItem != null && adminItem.getData() != null) {
                            res.setHighValue(adminItem.getData().isHighValue());
                            res.setPrivateItemDetails(adminItem.getData().getPrivateDetails());
                        }
                    } catch (Exception e) {
                        log.warn("Could not fetch admin item details for claim {}: {}", c.getId(), e.getMessage());
                    }
                    return res;
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN: Move claim to UNDER_VERIFICATION
    // ─────────────────────────────────────────────────────────

    @Transactional
    public ClaimResponse markUnderVerification(Long id, String verificationNotes, UserPrincipal admin) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Only PENDING claims can be moved to UNDER_VERIFICATION. Current status: " + claim.getStatus());
        }

        claim.setStatus(ClaimStatus.UNDER_VERIFICATION);
        claim.setVerificationNotes(verificationNotes);
        claim.setReviewedBy(admin.getName());
        claim.setReviewedAt(LocalDateTime.now());

        Claim saved = claimRepository.save(claim);
        log.info("Claim {} moved to UNDER_VERIFICATION by admin {}", id, admin.getName());

        // Notify claimant that their claim is under review
        sendNotification(saved.getClaimantUserId(),
            "Your claim for '" + saved.getItemName() + "' is now under verification. An admin is reviewing your evidence.",
            "GENERAL", saved.getId());

        return mapToResponse(saved, true);
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN: Approve a claim (item does NOT become RETURNED yet — handover required)
    // ─────────────────────────────────────────────────────────

    @Transactional
    public ClaimResponse approveClaim(Long id, ReviewClaimRequest request, UserPrincipal admin) {
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
        claim.setReviewedBy(admin.getName());
        claim.setReviewedAt(LocalDateTime.now());

        Claim saved = claimRepository.save(claim);
        log.info("Claim {} approved by admin {}. Item {} awaiting physical handover.", id, admin.getName(), saved.getItemId());

        // NOTE: Item status is NOT changed to RETURNED here.
        // It changes to RETURNED only after confirmHandover() is called.
        // We update to CLAIMED to indicate the claim is approved but item not yet handed over.
        try {
            itemClient.updateItemStatus(saved.getItemId(),
                new StatusUpdateRequest("CLAIMED", "Claim #" + saved.getId() + " approved — awaiting handover"));
        } catch (Exception e) {
            log.warn("Could not update item status after approval for item {}: {}", saved.getItemId(), e.getMessage());
        }

        // Auto-reject other pending claims for the same item
        rejectCompetingClaims(saved.getItemId(), saved.getId(), "Another claim has been approved for this item.");

        // Notify claimant of approval
        sendNotification(saved.getClaimantUserId(),
            "Your claim for '" + saved.getItemName() + "' has been approved! Please visit the Lost & Found office to collect your item.",
            "CLAIM_APPROVED", saved.getId());

        return mapToResponse(saved, true);
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN: Reject a claim
    // ─────────────────────────────────────────────────────────

    @Transactional
    public ClaimResponse rejectClaim(Long id, ReviewClaimRequest request, UserPrincipal admin) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (claim.getStatus() == ClaimStatus.REJECTED) {
            throw new BadRequestException("Claim #" + id + " is already rejected");
        }
        if (claim.getStatus() == ClaimStatus.APPROVED) {
            throw new BadRequestException("Cannot reject an already approved claim");
        }

        claim.setStatus(ClaimStatus.REJECTED);
        String comment = (request != null && request.getAdminComment() != null && !request.getAdminComment().isBlank())
                ? request.getAdminComment().trim()
                : "Claim rejected after review.";
        claim.setAdminComment(comment);
        claim.setReviewedBy(admin.getName());
        claim.setReviewedAt(LocalDateTime.now());

        Claim saved = claimRepository.save(claim);
        log.info("Claim {} rejected by admin {}", id, admin.getName());

        // Notify claimant of rejection
        sendNotification(saved.getClaimantUserId(),
            "Your claim for '" + saved.getItemName() + "' has been rejected. Reason: " + comment,
            "CLAIM_REJECTED", saved.getId());

        return mapToResponse(saved, true);
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN: Confirm physical handover — item becomes RETURNED
    // ─────────────────────────────────────────────────────────

    @Transactional
    public ClaimResponse confirmHandover(Long id, HandoverRequest request, UserPrincipal admin) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        if (claim.getStatus() != ClaimStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED claims can be confirmed for handover. Current status: " + claim.getStatus());
        }

        if (claim.getHandoverAt() != null) {
            throw new BadRequestException("Handover has already been confirmed for this claim on " + claim.getHandoverAt() + " by " + claim.getHandoverConfirmedBy());
        }

        if (request == null || request.getRecipientName() == null || request.getRecipientName().trim().isBlank()) {
            throw new BadRequestException("Recipient name is required to confirm handover");
        }

        String recipientName = request.getRecipientName().trim();
        String studentId = (request.getRecipientStudentId() != null && !request.getRecipientStudentId().trim().isBlank())
                ? request.getRecipientStudentId().trim()
                : (claim.getClaimantUserId() != null ? "STU-" + claim.getClaimantUserId() : "");

        // Prevent handing the item to a different claimant without additional authorized verification
        boolean isSameClaimant = recipientName.equalsIgnoreCase(claim.getClaimantName().trim());
        if (!isSameClaimant) {
            if (request.getNotes() == null || request.getNotes().trim().isBlank()) {
                throw new BadRequestException("Recipient name ('" + recipientName + "') does not match approved claimant ('" + claim.getClaimantName() + "'). Handover to a representative requires authorized verification details in handover notes.");
            }
        }

        claim.setHandoverConfirmedBy(admin.getName());
        claim.setHandoverAt(LocalDateTime.now());
        claim.setHandoverRecipient(recipientName);
        claim.setHandoverRecipientStudentId(studentId);

        StringBuilder notesBuilder = new StringBuilder();
        if (claim.getAdminComment() != null && !claim.getAdminComment().isBlank()) {
            notesBuilder.append(claim.getAdminComment()).append(" | ");
        }
        notesBuilder.append("Handover to ").append(recipientName);
        if (!studentId.isBlank()) {
            notesBuilder.append(" (ID: ").append(studentId).append(")");
        }
        if (request.getNotes() != null && !request.getNotes().trim().isBlank()) {
            notesBuilder.append(" - Notes: ").append(request.getNotes().trim());
        }
        claim.setAdminComment(notesBuilder.toString());

        Claim saved = claimRepository.save(claim);
        log.info("Handover confirmed for claim {} by admin {}. Recipient: {} (ID: {}). Item {} is now RETURNED.",
                id, admin.getName(), recipientName, studentId, saved.getItemId());

        // Now update item to RETURNED
        try {
            itemClient.updateItemStatus(saved.getItemId(),
                new StatusUpdateRequest("RETURNED", "Claim #" + saved.getId() + " — item handed over to " + saved.getHandoverRecipient()));
        } catch (Exception e) {
            log.warn("Could not update item status to RETURNED for item {}: {}", saved.getItemId(), e.getMessage());
        }

        // Notify claimant of successful handover
        sendNotification(saved.getClaimantUserId(),
            "Your item '" + saved.getItemName() + "' has been handed over successfully. Handover confirmed by " + admin.getName() + ".",
            "ITEM_RETURNED", saved.getId());

        // Notify item reporter that item was returned
        try {
            ApiResponse<ItemDto> itemResponse = itemClient.getItemById(saved.getItemId());
            if (itemResponse != null && itemResponse.getData() != null) {
                ItemDto itemDto = itemResponse.getData();
                if (itemDto.getUserId() != null && !itemDto.getUserId().equals(saved.getClaimantUserId())) {
                    sendNotification(itemDto.getUserId(),
                        "Great news! The item '" + saved.getItemName() + "' you reported has been verified and returned to its owner.",
                        "ITEM_RETURNED", saved.getId());
                }
            }
        } catch (Exception e) {
            log.warn("Could not notify reporter about handover for item {}: {}", saved.getItemId(), e.getMessage());
        }

        return mapToResponse(saved, true);
    }

    // ─────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────

    private ItemDto fetchItemOrThrow(Long itemId) {
        try {
            ApiResponse<ItemDto> response = itemClient.getItemById(itemId);
            if (response != null && response.getData() != null) {
                return response.getData();
            }
            throw new ResourceNotFoundException("Item not found with id: " + itemId);
        } catch (feign.FeignException.NotFound e) {
            throw new ResourceNotFoundException("Item not found with id: " + itemId);
        }
    }

    private void rejectCompetingClaims(Long itemId, Long approvedClaimId, String reason) {
        List<Claim> competing = claimRepository.findByItemIdAndStatus(itemId, ClaimStatus.PENDING);
        competing.addAll(claimRepository.findByItemIdAndStatus(itemId, ClaimStatus.UNDER_VERIFICATION));
        for (Claim c : competing) {
            if (!c.getId().equals(approvedClaimId)) {
                c.setStatus(ClaimStatus.REJECTED);
                c.setAdminComment(reason);
                claimRepository.save(c);
                sendNotification(c.getClaimantUserId(),
                    "Your claim for '" + c.getItemName() + "' has been closed because another claim was approved for this item.",
                    "CLAIM_REJECTED", c.getId());
            }
        }
    }

    private void sendNotification(Long userId, String message, String type, Long referenceId) {
        try {
            notificationClient.createNotification(new NotificationRequest(userId, message, type, referenceId));
        } catch (Exception e) {
            log.warn("Could not send {} notification to user {}: {}", type, userId, e.getMessage());
        }
    }

    private ClaimResponse mapToResponse(Claim claim, boolean isAdmin) {
        ClaimResponse res = new ClaimResponse();
        res.setId(claim.getId());
        res.setItemId(claim.getItemId());
        res.setItemName(claim.getItemName());
        res.setClaimantUserId(claim.getClaimantUserId());
        res.setClaimantName(claim.getClaimantName());
        res.setClaimantEmail(claim.getClaimantEmail());
        res.setClaimantPhone(claim.getClaimantPhone());
        res.setOwnershipDescription(claim.getOwnershipDescription());
        res.setProofDetails(claim.getProofDetails());
        res.setProofFileUrl(claim.getProofFileUrl());
        res.setStatus(claim.getStatus());
        res.setAdminComment(claim.getAdminComment());
        res.setVerificationNotes(claim.getVerificationNotes());
        res.setReviewedBy(claim.getReviewedBy());
        res.setReviewedAt(claim.getReviewedAt());
        res.setHandoverConfirmedBy(claim.getHandoverConfirmedBy());
        res.setHandoverAt(claim.getHandoverAt());
        res.setHandoverRecipient(claim.getHandoverRecipient());
        res.setHandoverRecipientStudentId(claim.getHandoverRecipientStudentId());
        res.setCreatedAt(claim.getCreatedAt());
        res.setUpdatedAt(claim.getUpdatedAt());
        // highValue and privateItemDetails populated separately from item-service when needed
        return res;
    }
}