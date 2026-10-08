package com.campus.lostfound.claim.controller;

import com.campus.lostfound.claim.dto.ApiResponse;
import com.campus.lostfound.claim.dto.CreateClaimRequest;
import com.campus.lostfound.claim.dto.ClaimResponse;
import com.campus.lostfound.claim.dto.ReviewClaimRequest;
import com.campus.lostfound.claim.entity.ClaimStatus;
import com.campus.lostfound.claim.security.UserPrincipal;
import com.campus.lostfound.claim.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Claim Management", description = "Endpoints for submitting and verifying ownership claims")
@SecurityRequirement(name = "bearerAuth")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    /**
     * Submit an ownership claim for a found/matched item.
     * Only authenticated student users can submit claims.
     */
    @PostMapping("/api/claims")
    @Operation(summary = "Submit an ownership claim for an item")
    public ResponseEntity<ApiResponse<ClaimResponse>> submitClaim(
            @Valid @RequestBody CreateClaimRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        ClaimResponse response = claimService.submitClaim(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Claim submitted successfully", response));
    }

    /**
     * Retrieve claims submitted by the currently authenticated student.
     */
    @GetMapping("/api/claims/my")
    @Operation(summary = "Get current logged-in user's claims")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getMyClaims(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        List<ClaimResponse> claims = claimService.getMyClaims(principal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Claims retrieved successfully", claims));
    }

    /**
     * Get claim details by ID.
     * A student can view their own claim; an Admin can view any claim.
     */
    @GetMapping("/api/claims/{id:[0-9]+}")
    @Operation(summary = "Get claim details by ID")
    public ResponseEntity<ApiResponse<ClaimResponse>> getClaimById(
            @PathVariable("id") Long id,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        ClaimResponse claim = claimService.getClaimById(id, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim retrieved successfully", claim));
    }

    /**
     * Admin: List all claims with optional status filter.
     * Supports both /api/admin/claims and /api/claims/admin/all.
     */
    @GetMapping({"/api/claims", "/api/admin/claims", "/api/claims/admin/all", "/admin/claims"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Admin: List all claims with optional status filter")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getAllClaims(
            @RequestParam(value = "status", required = false) ClaimStatus status) {

        List<ClaimResponse> claims = claimService.getAllClaims(status);
        return ResponseEntity.ok(new ApiResponse<>(true, "All claims retrieved successfully", claims));
    }

    /**
     * Admin: Approve an ownership claim.
     * Supports both /api/admin/claims/{id}/approve and /api/claims/{id}/approve.
     */
    @PutMapping({"/api/admin/claims/{id:[0-9]+}/approve", "/api/claims/{id:[0-9]+}/approve", "/admin/claims/{id:[0-9]+}/approve"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Admin: Approve an ownership claim")
    public ResponseEntity<ApiResponse<ClaimResponse>> approveClaim(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ReviewClaimRequest request) {

        ClaimResponse approved = claimService.approveClaim(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim approved successfully and item marked RETURNED", approved));
    }

    /**
     * Admin: Reject an ownership claim.
     * Supports both /api/admin/claims/{id}/reject and /api/claims/{id}/reject.
     */
    @PutMapping({"/api/admin/claims/{id:[0-9]+}/reject", "/api/claims/{id:[0-9]+}/reject", "/admin/claims/{id:[0-9]+}/reject"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Admin: Reject an ownership claim")
    public ResponseEntity<ApiResponse<ClaimResponse>> rejectClaim(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ReviewClaimRequest request) {

        ClaimResponse rejected = claimService.rejectClaim(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim rejected successfully", rejected));
    }

    /**
     * Admin: Get total pending claims count.
     */
    @GetMapping({"/api/admin/claims/pending/count", "/api/claims/pending/count", "/admin/claims/pending/count"})
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Admin: Get total pending claims count")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        long count = claimService.countPending();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending count retrieved", count));
    }

    private UserPrincipal resolvePrincipal(Authentication auth, Long hUserId, String hRole, String hEmail, String hName) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) auth.getPrincipal();
        }
        if (hUserId != null) {
            return new UserPrincipal(hUserId,
                    hEmail != null ? hEmail : "student@campus.edu",
                    hName != null ? hName : "Campus Student",
                    hRole != null ? hRole : "STUDENT");
        }
        return new UserPrincipal(1L, "student@campus.edu", "Campus Student", "STUDENT");
    }
}