package com.campus.lostfound.notification.dto;

import com.campus.lostfound.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateNotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Notification message is required")
    private String message;

    private NotificationType type = NotificationType.GENERAL;

    private Long referenceId;

    public CreateNotificationRequest() {}

    public CreateNotificationRequest(Long userId, String message, NotificationType type) {
        this.userId = userId;
        this.message = message;
        this.type = type;
    }

    public CreateNotificationRequest(Long userId, String message, NotificationType type, Long referenceId) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
}
