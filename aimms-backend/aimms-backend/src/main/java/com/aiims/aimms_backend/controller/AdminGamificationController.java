package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.GamificationConfig;
import com.aiims.aimms_backend.model.RewardLog;
import com.aiims.aimms_backend.repository.GamificationConfigRepository;
import com.aiims.aimms_backend.repository.RewardLogRepository;
import com.aiims.aimms_backend.repository.UserBadgeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/gamification")
@CrossOrigin(origins = "*")
public class AdminGamificationController {

    private final GamificationConfigRepository configRepo;
    private final RewardLogRepository logRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final com.aiims.aimms_backend.repository.BadgeRepository badgeRepo;

    public AdminGamificationController(GamificationConfigRepository configRepo, RewardLogRepository logRepo,
            UserBadgeRepository userBadgeRepo, com.aiims.aimms_backend.repository.BadgeRepository badgeRepo) {
        this.configRepo = configRepo;
        this.logRepo = logRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.badgeRepo = badgeRepo;
    }

    @GetMapping("/config")
    public ResponseEntity<GamificationConfig> getConfig() {
        return ResponseEntity.ok(configRepo.findAll().stream().findFirst().orElseGet(() -> {
            GamificationConfig c = new GamificationConfig();
            return configRepo.save(c);
        }));
    }

    @PutMapping("/config")
    public ResponseEntity<GamificationConfig> updateConfig(@RequestBody GamificationConfig config) {
        // Ensure only one config exists
        GamificationConfig existing = configRepo.findAll().stream().findFirst().orElse(new GamificationConfig());
        existing.setBudgetTolerance(config.getBudgetTolerance());
        existing.setSavingsGoalThreshold(config.getSavingsGoalThreshold());
        existing.setBudgetMasterEnabled(config.isBudgetMasterEnabled());
        existing.setSavingsGuruEnabled(config.isSavingsGuruEnabled());
        return ResponseEntity.ok(configRepo.save(existing));
    }

    @GetMapping("/logs")
    public List<RewardLog> getRecentLogs() {
        return logRepo.findTop50ByOrderByTimestampDesc();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBadgesAwarded", userBadgeRepo.count());
        stats.put("totalLogs", logRepo.count());
        // Add more rigorous aggregations if needed
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/badges")
    public List<com.aiims.aimms_backend.model.Badge> getAllBadges() {
        return badgeRepo.findAll();
    }

    @PostMapping("/badges")
    public com.aiims.aimms_backend.model.Badge createBadge(@RequestBody com.aiims.aimms_backend.model.Badge badge) {
        return badgeRepo.save(badge);
    }

    @PutMapping("/badges/{id}")
    public ResponseEntity<com.aiims.aimms_backend.model.Badge> updateBadge(@PathVariable Long id,
            @RequestBody com.aiims.aimms_backend.model.Badge details) {
        return badgeRepo.findById(id).map(badge -> {
            badge.setName(details.getName());
            badge.setDescription(details.getDescription());
            badge.setActive(details.isActive());
            badge.setRuleType(details.getRuleType());
            badge.setThreshold(details.getThreshold());
            badge.setIcon(details.getIcon());
            return ResponseEntity.ok(badgeRepo.save(badge));
        }).orElse(ResponseEntity.notFound().build());
    }
}
