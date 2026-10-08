package com.campus.lostfound.notification.repository;

import com.campus.lostfound.notification.entity.Notification;
import com.campus.lostfound.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
    boolean existsByUserIdAndReferenceIdAndType(Long userId, Long referenceId, NotificationType type);
    boolean existsByUserIdAndMessage(Long userId, String message);
}