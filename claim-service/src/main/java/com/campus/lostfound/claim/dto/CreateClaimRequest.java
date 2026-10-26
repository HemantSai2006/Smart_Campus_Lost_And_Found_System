package com.campus.lostfound.claim.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateClaimRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotBlank(message = "Ownership description is required")
    @Size(min = 10, max = 2000, message = "Ownership description must be between 10 and 2000 characters")
    private String ownershipDescription;

    private String proofDetails;

    /** URL of uploaded evidence file (photo of bill, receipt, etc.) — uploaded via item-service first */
    private String proofFileUrl;

    public CreateClaimRequest() {}

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getOwnershipDescription() { return ownershipDescription; }
    public void setOwnershipDescription(String ownershipDescription) { this.ownershipDescription = ownershipDescription; }

    public String getProofDetails() { return proofDetails; }
    public void setProofDetails(String proofDetails) { this.proofDetails = proofDetails; }

    public String getProofFileUrl() { return proofFileUrl; }
    public void setProofFileUrl(String proofFileUrl) { this.proofFileUrl = proofFileUrl; }
}
