package com.campus.lostfound.notification.service;

import com.campus.lostfound.notification.dto.CreateNotificationRequest;
import com.campus.lostfound.notification.dto.NotificationResponse;
import com.campus.lostfound.notification.entity.Notification;
import com.campus.lostfound.notification.entity.NotificationType;
import com.campus.lostfound.notification.exception.ResourceNotFoundException;
import com.campus.lostfound.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Internal endpoint method for creating in-app notifications.
     * Prevents duplicate notifications for the same reference ID and type.
     */
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        // Prevent duplicate notifications for the same reference ID and type (e.g. repeated matching scans)
        if (request.getReferenceId() != null && request.getType() != null) {
            if (notificationRepository.existsByUserIdAndReferenceIdAndType(request.getUserId(), request.getReferenceId(), request.getType())) {
                log.info("Duplicate notification ignored for userId={}, referenceId={}, type={}",
                        request.getUserId(), request.getReferenceId(), request.getType());
                List<Notification> existing = notificationRepository.findByUserIdOrderByCreatedAtDesc(request.getUserId());
                for (Notification n : existing) {
                    if (Objects.equals(n.getReferenceId(), request.getReferenceId()) && n.getType() == request.getType()) {
                        return mapToResponse(n);
                    }
                }
            }
        }

        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setMessage(request.getMessage().trim());
        notification.setType(request.getType() != null ? request.getType() : NotificationType.GENERAL);
        notification.setReferenceId(request.getReferenceId());
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification ID={} for userId={} type={}", saved.getId(), saved.getUserId(), saved.getType());
        return mapToResponse(saved);
    }

    /**
     * Retrieve all notifications for a specific user sorted by createdAt DESC.
     */
    public List<NotificationResponse> getUserNotifications(Long userId, boolean unreadOnly) {
        List<Notification> list = unreadOnly
                ? notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Count unread notifications for a specific user.
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark a single notification as read with ownership validation.
     */
    @Transactional
    public NotificationResponse markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!Objects.equals(notification.getUserId(), userId)) {
            throw new AccessDeniedException("You are not authorized to modify another user's notification");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    /**
     * Mark all notifications for current user as read.
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadList = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unreadList) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unreadList);
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setUserId(n.getUserId());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setReferenceId(n.getReferenceId());
        res.setRead(n.isRead());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }
}