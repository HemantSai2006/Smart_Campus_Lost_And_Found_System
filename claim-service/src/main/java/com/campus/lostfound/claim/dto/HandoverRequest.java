package com.campus.lostfound.claim.dto;

public class HandoverRequest {
    private String recipientName;
    private String recipientStudentId;
    private String notes;

    public HandoverRequest() {}

    public HandoverRequest(String recipientName, String recipientStudentId, String notes) {
        this.recipientName = recipientName;
        this.recipientStudentId = recipientStudentId;
        this.notes = notes;
    }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientStudentId() { return recipientStudentId; }
    public void setRecipientStudentId(String recipientStudentId) { this.recipientStudentId = recipientStudentId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
