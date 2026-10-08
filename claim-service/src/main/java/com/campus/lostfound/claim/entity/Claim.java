package com.campus.lostfound.claim.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long itemId;

    private String itemName;

    @Column(nullable = false)
    private Long claimantUserId;

    private String claimantName;
    private String claimantEmail;
    private String claimantPhone;

    @Column(nullable = false, length = 2000)
    private String ownershipDescription;

    @Column(length = 2000)
    private String proofDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(length = 1000)
    private String adminComment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Claim() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ClaimStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }

    public String getAdminComment() { return adminComment; }
    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}