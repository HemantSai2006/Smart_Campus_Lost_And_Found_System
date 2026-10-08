package com.campus.lostfound.notification.controller;

import com.campus.lostfound.notification.dto.ApiResponse;
import com.campus.lostfound.notification.dto.CreateNotificationRequest;
import com.campus.lostfound.notification.dto.NotificationResponse;
import com.campus.lostfound.notification.dto.UnreadCountResponse;
import com.campus.lostfound.notification.security.UserPrincipal;
import com.campus.lostfound.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification System", description = "In-app notifications for matches, claims, and status updates")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Inter-service internal endpoint for creating notifications.
     * Can be invoked by Matching Service and Claim Service without a user JWT.
     */
    @PostMapping({"/internal", ""})
    @Operation(summary = "Create an in-app notification (Internal / Inter-service)")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Notification created successfully", response));
    }

    /**
     * Retrieve all notifications for the authenticated user, sorted newest first.
     */
    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current user notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName,
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        List<NotificationResponse> notifications = notificationService.getUserNotifications(principal.getId(), unreadOnly);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications retrieved successfully", notifications));
    }

    /**
     * Get count of unread notifications for badge icon.
     */
    @GetMapping("/unread-count")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get count of unread notifications for badge icon")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        long count = notificationService.getUnreadCount(principal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count retrieved", new UnreadCountResponse(count)));
    }

    /**
     * Mark a single notification as read with ownership validation.
     */
    @PutMapping("/{id:[0-9]+}/read")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable("id") Long id,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        NotificationResponse response = notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", response));
    }

    /**
     * Mark all notifications for current user as read.
     */
    @PutMapping("/read-all")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Mark all notifications for current user as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read"));
    }

    private UserPrincipal resolvePrincipal(Authentication auth, Long hUserId, String hRole, String hEmail, String hName) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) auth.getPrincipal();
        }
        if (hUserId != null) {
            return new UserPrincipal(hUserId,
                    hEmail != null ? hEmail : "student@campus.edu",
                    hName != null ? hName : "Campus Student",
                    hRole != null ? hRole : "STUDENT");
        }
        return new UserPrincipal(1L, "student@campus.edu", "Campus Student", "STUDENT");
    }
}