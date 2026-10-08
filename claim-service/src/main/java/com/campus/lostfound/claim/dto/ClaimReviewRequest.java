package com.campus.lostfound.claim.dto;

public class ClaimReviewRequest {
    private String adminComment;

    public ClaimReviewRequest() {}
    public ClaimReviewRequest(String adminComment) { this.adminComment = adminComment; }

    public String getAdminComment() { return adminComment; }
    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }
}