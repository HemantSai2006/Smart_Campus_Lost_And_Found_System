package com.campus.lostfound.claim.dto;

public class ReviewClaimRequest {

    private String adminComment;

    public ReviewClaimRequest() {}

    public ReviewClaimRequest(String adminComment) {
        this.adminComment = adminComment;
    }

    public String getAdminComment() { return adminComment; }
    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }
}
