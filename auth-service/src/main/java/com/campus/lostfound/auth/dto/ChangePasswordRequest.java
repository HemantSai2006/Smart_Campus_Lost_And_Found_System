package com.campus.lostfound.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    private String currentPassword;
    private String oldPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;

    public ChangePasswordRequest() {}

    public ChangePasswordRequest(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.oldPassword = currentPassword;
        this.newPassword = newPassword;
    }

    public String getCurrentPassword() {
        return currentPassword != null ? currentPassword : oldPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
        if (this.oldPassword == null) {
            this.oldPassword = currentPassword;
        }
    }

    public String getOldPassword() {
        return oldPassword != null ? oldPassword : currentPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
        if (this.currentPassword == null) {
            this.currentPassword = oldPassword;
        }
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
