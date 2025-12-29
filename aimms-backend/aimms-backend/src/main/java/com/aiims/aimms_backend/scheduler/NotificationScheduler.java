package com.aiims.aimms_backend.scheduler;

import com.aiims.aimms_backend.model.Notification;
import com.aiims.aimms_backend.model.NotificationStatus;
import com.aiims.aimms_backend.repository.NotificationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class NotificationScheduler {

    private final NotificationRepository repo;

    public NotificationScheduler(NotificationRepository repo) {
        this.repo = repo;
    }

    @Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
    public void publishScheduledNotifications() {
        Instant now = Instant.now();
        List<Notification> scheduled = repo.findByStatusAndScheduledAtLessThanEqual(NotificationStatus.SCHEDULED, now);

        if (!scheduled.isEmpty()) {
            System.out.println("SCHEDULER: Found " + scheduled.size() + " scheduled notifications to publish.");
            for (Notification n : scheduled) {
                n.setStatus(NotificationStatus.PUBLISHED);
                System.out.println("SCHEDULER: Publishing - " + n.getTitle());
            }
            repo.saveAll(scheduled);
        }
    }
}
