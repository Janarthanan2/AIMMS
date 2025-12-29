package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.Notification;
import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.List;

import com.aiims.aimms_backend.model.NotificationStatus;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    List<Notification> findByUserUserId(Long userId);

    // For Scheduler: Find scheduled items ready to publish
    List<Notification> findByStatusAndScheduledAtLessThanEqual(NotificationStatus status, Instant now);

    // For Users: Only show PUBLISHED broadcasts
    @Query("SELECT n FROM Notification n WHERE n.broadcast = true AND n.status = :status AND (n.expiresAt IS NULL OR n.expiresAt > :now)")
    List<Notification> findPublishedBroadcasts(@Param("status") NotificationStatus status, @Param("now") Instant now);

    // For Admin: Show all broadcasts
    List<Notification> findByBroadcastTrueOrderByCreatedAtDesc();
}
