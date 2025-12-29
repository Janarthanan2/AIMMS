package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {
    List<NotificationRead> findByUserId(Long userId);

    boolean existsByUserIdAndNotificationId(Long userId, Long notificationId);
}
