package com.campus.lostfound.auth.controller;

import com.campus.lostfound.auth.dto.ApiResponse;
import com.campus.lostfound.auth.dto.ChangePasswordRequest;
import com.campus.lostfound.auth.dto.ProfileResponse;
import com.campus.lostfound.auth.dto.UpdateProfileRequest;
import com.campus.lostfound.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for profile management and user administration")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication authentication) {
        ProfileResponse profile = userService.getProfile(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse updated = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", updated));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Admin: List all users", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getAllUsers() {
        List<ProfileResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched successfully", users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ProfileResponse>> getUserById(@PathVariable("id") Long id) {
        ProfileResponse user = userService.getUserById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User fetched successfully", user));
    }
}