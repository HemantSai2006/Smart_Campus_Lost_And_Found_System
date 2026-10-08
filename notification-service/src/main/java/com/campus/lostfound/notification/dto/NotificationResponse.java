package com.campus.lostfound.notification.dto;

import com.campus.lostfound.notification.entity.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private Long userId;
    private String message;
    private NotificationType type;
    private Long referenceId;
    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    public boolean isRead() { return isRead; }

    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    public void setRead(boolean read) { isRead = read; }

    @com.fasterxml.jackson.annotation.JsonProperty("read")
    public boolean getRead() { return isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}