package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Notification;
import com.aiims.aimms_backend.model.Admin;
import com.aiims.aimms_backend.model.NotificationRead;
import com.aiims.aimms_backend.model.NotificationStatus;
import com.aiims.aimms_backend.repository.NotificationRepository;
import com.aiims.aimms_backend.repository.NotificationReadRepository;
import com.aiims.aimms_backend.repository.AdminRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.aiims.aimms_backend.service.AuditService;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {
    private final NotificationRepository repo;
    private final NotificationReadRepository readRepo;
    private final AdminRepository adminRepo;
    private final AuditService auditService;

    public NotificationController(NotificationRepository repo, NotificationReadRepository readRepo,
            AdminRepository adminRepo, AuditService auditService) {
        this.repo = repo;
        this.readRepo = readRepo;
        this.adminRepo = adminRepo;
        this.auditService = auditService;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> list(@PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String priority) {
        // Fetch all relevant
        List<Notification> userNotifications = repo.findByUserUserId(userId);
        Instant now = Instant.now();
        System.out.println("DEBUG: Fetching broadcasts for time: " + now);

        // Use the new method with explicit status
        List<Notification> broadcasts = repo.findPublishedBroadcasts(NotificationStatus.PUBLISHED, now);

        System.out.println("DEBUG: Found broadcasts: " + broadcasts.size());
        for (Notification b : broadcasts) {
            System.out.println("DEBUG: Broadcast: " + b.getTitle() + " | Scheduled: " + b.getScheduledAt());
        }

        // Overlay read status for broadcasts
        List<NotificationRead> reads = readRepo.findByUserId(userId);
        Set<Long> readNotificationIds = reads.stream().map(NotificationRead::getNotificationId)
                .collect(Collectors.toSet());

        for (Notification n : broadcasts) {
            if (readNotificationIds.contains(n.getNotificationId())) {
                n.setRead(true);
            } else {
                n.setRead(false);
            }
        }

        userNotifications.addAll(broadcasts);

        // Filter by Priority if present
        if (priority != null && !priority.isEmpty() && !priority.equalsIgnoreCase("ALL")) {
            userNotifications.removeIf(n -> !n.getPriority().equalsIgnoreCase(priority));
        }

        // Sort
        userNotifications.sort((n1, n2) -> {
            if (n1.isPinned() != n2.isPinned())
                return n1.isPinned() ? -1 : 1;
            int p1 = getPriorityValue(n1.getPriority());
            int p2 = getPriorityValue(n2.getPriority());
            if (p1 != p2)
                return p2 - p1;
            return n2.getCreatedAt().compareTo(n1.getCreatedAt());
        });

        // Pagination
        int start = page * size;
        if (start >= userNotifications.size())
            return List.of();
        int end = Math.min(start + size, userNotifications.size());
        return userNotifications.subList(start, end);
    }

    private int getPriorityValue(String p) {
        if ("HIGH".equalsIgnoreCase(p))
            return 3;
        if ("MEDIUM".equalsIgnoreCase(p))
            return 2;
        return 1;
    }

    @GetMapping("/broadcasts")
    public List<Notification> getAllBroadcasts() {
        System.out.println("DEBUG: Fetching ALL broadcasts (Admin View)");
        List<Notification> list = repo.findByBroadcastTrueOrderByCreatedAtDesc();
        System.out.println("DEBUG: Found " + list.size() + " broadcasts in DB.");
        return list;
    }

    @PostMapping("/create")
    public ResponseEntity<Notification> create(@RequestBody Notification n,
            @RequestParam(required = false) Long adminId) {
        if (n.isBroadcast()) {
            n.setUser(null);
        }

        System.out.println("DEBUG: Create Notification Request. ScheduledAt: " + n.getScheduledAt());

        // Auto-Publishing Logic
        if (n.getScheduledAt() == null) {
            // Immediate Publish
            ZonedDateTime istNow = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
            n.setScheduledAt(istNow.toInstant());
            n.setStatus(NotificationStatus.PUBLISHED);
        } else {
            // Scheduled for Future
            n.setStatus(NotificationStatus.SCHEDULED);
        }

        if (adminId != null) {
            adminRepo.findById(adminId).ifPresent(n::setCreatedBy);
        }
        Notification saved = repo.save(n);
        // Using toString() or similar for status logging
        auditService.log("NOTIFICATION_CREATED", "Title: " + n.getTitle() + ", Status: " + n.getStatus(), adminId);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/pin")
    public ResponseEntity<Notification> togglePin(@PathVariable Long id) {
        return repo.findById(id).map(n -> {
            n.setPinned(!n.isPinned());
            Notification saved = repo.save(n);
            auditService.log("NOTIFICATION_PINNED", "ID: " + id + ", Pinned: " + n.isPinned(), null);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        auditService.log("NOTIFICATION_DELETED", "ID: " + id, null);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<?> markRead(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        return repo.findById(id).map(n -> {
            if (n.isBroadcast()) {
                if (userId != null && !readRepo.existsByUserIdAndNotificationId(userId, id)) {
                    readRepo.save(new NotificationRead(userId, id));
                }
                return ResponseEntity.ok(n);
            } else {
                n.setRead(true);
                return ResponseEntity.ok(repo.save(n));
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
