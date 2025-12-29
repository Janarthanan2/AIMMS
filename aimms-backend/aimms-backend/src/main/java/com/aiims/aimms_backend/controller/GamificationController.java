package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.*;
import com.aiims.aimms_backend.repository.BadgeRepository;
import com.aiims.aimms_backend.repository.UserBadgeRepository;
import com.aiims.aimms_backend.repository.UserRepository;
import com.aiims.aimms_backend.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = "*")
public class GamificationController {

    private final GamificationService service;
    private final UserRepository userRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final BadgeRepository badgeRepo;

    public GamificationController(GamificationService service, UserRepository userRepo,
            UserBadgeRepository userBadgeRepo, BadgeRepository badgeRepo) {
        this.service = service;
        this.userRepo = userRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.badgeRepo = badgeRepo;
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        return userRepo.findById(userId).map(user -> {
            Map<String, Object> stats = new HashMap<>();
            stats.put("points", user.getPoints());
            stats.put("level", user.getLevel());

            List<UserBadge> earned = userBadgeRepo.findByUserUserId(userId);
            stats.put("earnedBadges", earned);

            // Calculate progress to next level
            int p = user.getPoints();
            int nextLevelPoints = 500;
            if (p >= 5000)
                nextLevelPoints = 10000;
            else if (p >= 2500)
                nextLevelPoints = 5000;
            else if (p >= 1000)
                nextLevelPoints = 2500;
            else if (p >= 500)
                nextLevelPoints = 1000;

            stats.put("nextLevelPoints", nextLevelPoints);

            return ResponseEntity.ok(stats);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/badges/all")
    public List<Badge> getAllBadges() {
        return badgeRepo.findAll();
    }

    @PostMapping("/trigger-monthly/{userId}")
    public ResponseEntity<Void> triggerMonthlyCheck(@PathVariable Long userId) {
        service.checkMonthlyRewards(userId);
        return ResponseEntity.ok().build();
    }
}
