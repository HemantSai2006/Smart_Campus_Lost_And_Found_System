package com.campus.lostfound.claim.dto;

import com.campus.lostfound.claim.entity.ClaimStatus;

import java.time.LocalDateTime;

public class ClaimResponse {
    private Long id;
    private Long itemId;
    private String itemName;
    private Long claimantUserId;
    private String claimantName;
    private String claimantEmail;
    private String claimantPhone;
    private String ownershipDescription;
    private String proofDetails;
    private String proofFileUrl;
    private ClaimStatus status;
    private String adminComment;
    private String verificationNotes;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String handoverConfirmedBy;
    private LocalDateTime handoverAt;
    private String handoverRecipient;
    private String handoverRecipientStudentId;
    /** Whether the associated item is flagged as high value */
    private boolean highValue;
    /** Private item details (finder-entered) — only populated for ADMIN callers */
    private String privateItemDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClaimResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Long getClaimantUserId() { return claimantUserId; }
    public void setClaimantUserId(Long claimantUserId) { this.claimantUserId = claimantUserId; }

    public String getClaimantName() { return claimantName; }
    public void setClaimantName(String claimantName) { this.claimantName = claimantName; }

    public String getClaimantEmail() { return claimantEmail; }
    public void setClaimantEmail(String claimantEmail) { this.claimantEmail = claimantEmail; }

    public String getClaimantPhone() { return claimantPhone; }
    public void setClaimantPhone(String claimantPhone) { this.claimantPhone = claimantPhone; }

    public String getOwnershipDescription() { return ownershipDescription; }
    public void setOwnershipDescription(String ownershipDescription) { this.ownershipDescription = ownershipDescription; }

    public String getProofDetails() { return proofDetails; }
    public void setProofDetails(String proofDetails) { this.proofDetails = proofDetails; }

    public String getProofFileUrl() { return proofFileUrl; }
    public void setProofFileUrl(String proofFileUrl) { this.proofFileUrl = proofFileUrl; }

    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }

    public String getAdminComment() { return adminComment; }
    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }

    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getHandoverConfirmedBy() { return handoverConfirmedBy; }
    public void setHandoverConfirmedBy(String handoverConfirmedBy) { this.handoverConfirmedBy = handoverConfirmedBy; }

    public LocalDateTime getHandoverAt() { return handoverAt; }
    public void setHandoverAt(LocalDateTime handoverAt) { this.handoverAt = handoverAt; }

    public String getHandoverRecipient() { return handoverRecipient; }
    public void setHandoverRecipient(String handoverRecipient) { this.handoverRecipient = handoverRecipient; }

    public String getHandoverRecipientStudentId() { return handoverRecipientStudentId; }
    public void setHandoverRecipientStudentId(String handoverRecipientStudentId) { this.handoverRecipientStudentId = handoverRecipientStudentId; }

    public boolean isHighValue() { return highValue; }
    public void setHighValue(boolean highValue) { this.highValue = highValue; }

    public String getPrivateItemDetails() { return privateItemDetails; }
    public void setPrivateItemDetails(String privateItemDetails) { this.privateItemDetails = privateItemDetails; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}