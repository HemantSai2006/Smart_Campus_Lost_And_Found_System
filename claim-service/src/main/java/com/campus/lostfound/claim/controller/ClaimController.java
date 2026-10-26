package com.campus.lostfound.claim.controller;

import com.campus.lostfound.claim.dto.*;
import com.campus.lostfound.claim.entity.ClaimStatus;
import com.campus.lostfound.claim.security.UserPrincipal;
import com.campus.lostfound.claim.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    // ─── STUDENT: Submit a claim ───────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<ClaimResponse>> submitClaim(
            @Valid @RequestBody CreateClaimRequest request,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        ClaimResponse response = claimService.submitClaim(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Claim submitted successfully", response));
    }

    // ─── STUDENT: Get own claims ───────────────────────────────────────────────

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getMyClaims(Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        List<ClaimResponse> claims = claimService.getMyClaims(principal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Claims retrieved", claims));
    }

    // ─── STUDENT or ADMIN: Get single claim ───────────────────────────────────

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<ApiResponse<ClaimResponse>> getClaimById(
            @PathVariable Long id,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        ClaimResponse claim = claimService.getClaimById(id, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim retrieved", claim));
    }

    // ─── ADMIN: Get all claims ─────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getAllClaims(
            @RequestParam(required = false) String status) {
        ClaimStatus claimStatus = null;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            claimStatus = ClaimStatus.valueOf(status.toUpperCase());
        }
        List<ClaimResponse> claims = claimService.getAllClaims(claimStatus);
        return ResponseEntity.ok(new ApiResponse<>(true, "All claims retrieved", claims));
    }

    // ─── ADMIN: Move claim to UNDER_VERIFICATION ───────────────────────────────

    @PutMapping("/{id:[0-9]+}/under-verification")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ClaimResponse>> markUnderVerification(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewClaimRequest request,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        String notes = (request != null && request.getAdminComment() != null) ? request.getAdminComment() : "";
        ClaimResponse response = claimService.markUnderVerification(id, notes, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim moved to Under Verification", response));
    }

    // ─── ADMIN: Approve a claim ────────────────────────────────────────────────

    @PutMapping("/{id:[0-9]+}/approve")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ClaimResponse>> approveClaim(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewClaimRequest request,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        ClaimResponse response = claimService.approveClaim(id, request, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim approved", response));
    }

    // ─── ADMIN: Reject a claim ─────────────────────────────────────────────────

    @PutMapping("/{id:[0-9]+}/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ClaimResponse>> rejectClaim(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewClaimRequest request,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        ClaimResponse response = claimService.rejectClaim(id, request, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim rejected", response));
    }

    // ─── ADMIN: Confirm physical handover ─────────────────────────────────────

    @PutMapping("/{id:[0-9]+}/confirm-handover")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ClaimResponse>> confirmHandover(
            @PathVariable Long id,
            @RequestBody HandoverRequest request,
            Authentication auth) {
        UserPrincipal principal = getPrincipal(auth);
        ClaimResponse response = claimService.confirmHandover(id, request, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Handover confirmed. Item is now RETURNED.", response));
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private UserPrincipal getPrincipal(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) auth.getPrincipal();
        }
        throw new org.springframework.security.access.AccessDeniedException("Authentication required");
    }
}