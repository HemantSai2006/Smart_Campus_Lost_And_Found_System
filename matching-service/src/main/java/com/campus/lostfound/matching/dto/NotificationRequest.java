package com.campus.lostfound.matching.dto;

public class NotificationRequest {
    private Long userId;
    private String message;
    private String type;
    private Long referenceId;

    public NotificationRequest() {}

    public NotificationRequest(Long userId, String message, String type, Long referenceId) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
}