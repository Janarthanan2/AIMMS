package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.*;
import com.aiims.aimms_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

@Service
public class GamificationService {
    private final UserRepository userRepo;
    private final BadgeRepository badgeRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final BudgetRepository budgetRepo;
    private final TransactionRepository transactionRepo;
    private final AuditService auditService;
    private final NotificationRepository notificationRepo;
    private final GamificationConfigRepository configRepo;
    private final RewardLogRepository logRepo;

    public GamificationService(UserRepository userRepo, BadgeRepository badgeRepo,
            UserBadgeRepository userBadgeRepo, BudgetRepository budgetRepo,
            TransactionRepository transactionRepo, AuditService auditService,
            NotificationRepository notificationRepo, GamificationConfigRepository configRepo,
            RewardLogRepository logRepo) {
        this.userRepo = userRepo;
        this.badgeRepo = badgeRepo;
        this.userBadgeRepo = userBadgeRepo;
        this.budgetRepo = budgetRepo;
        this.transactionRepo = transactionRepo;
        this.auditService = auditService;
        this.notificationRepo = notificationRepo;
        this.configRepo = configRepo;
        this.logRepo = logRepo;
    }

    public void awardPoints(Long userId, int points) {
        userRepo.findById(userId).ifPresent(user -> {
            user.setPoints(user.getPoints() + points);
            updateLevel(user);
            userRepo.save(user);
            logReward(userId, "POINTS_AWARDED", "Awarded " + points + " points.");
        });
    }

    private void updateLevel(User user) {
        int p = user.getPoints();
        String newLevel = "ROOKIE";
        if (p >= 5000)
            newLevel = "PLATINUM";
        else if (p >= 2500)
            newLevel = "GOLD";
        else if (p >= 1000)
            newLevel = "SILVER";
        else if (p >= 500)
            newLevel = "BRONZE";

        if (!newLevel.equals(user.getLevel())) {
            user.setLevel(newLevel);
            // Notify user of level up
            Notification n = new Notification();
            n.setTitle("Level Up: " + newLevel + "!");
            n.setBody("Congratulations! You've reached " + newLevel + " tier.");
            n.setUser(user);
            n.setPriority("HIGH");
            notificationRepo.save(n);
            logReward(user.getUserId(), "LEVEL_UP", "Reached level " + newLevel);
        }
    }

    @Transactional
    public void checkMonthlyRewards(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        GamificationConfig config = configRepo.findAll().stream().findFirst().orElseGet(() -> {
            GamificationConfig c = new GamificationConfig();
            return configRepo.save(c);
        });

        LocalDate now = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());

        // Check Budget Compliance
        List<Budget> budgets = budgetRepo.findByUserUserId(userId);

        Double totalLimit = budgets.stream().mapToDouble(Budget::getLimitAmount).sum();
        List<Transaction> txns = transactionRepo.findByUserUserIdAndTxnDateBetween(
                userId, startOfMonth.atStartOfDay(), now.atTime(23, 59, 59));
        Double totalSpent = txns.stream().mapToDouble(Transaction::getAmount).sum();

        // 1. Fetch all active badges
        List<Badge> activeBadges = badgeRepo.findByActiveTrue();

        for (Badge badge : activeBadges) {
            boolean eligible = false;

            // 2. Evaluate Rule
            String rule = badge.getRuleType() != null ? badge.getRuleType() : "TOTAL_BUDGET_PERCENT";
            switch (rule) {
                case "TOTAL_BUDGET_PERCENT":
                    // Rule: Spent <= Budget * Threshold
                    if (totalLimit > 0) {
                        double limit = totalLimit * badge.getThreshold();
                        // Apply global tolerance from config if applicable
                        if (badge.getCode().equals("BUDGET_MASTER")) {
                            limit = limit * (1.0 + config.getBudgetTolerance());
                        }
                        if (totalSpent <= limit)
                            eligible = true;
                    }
                    break;

                case "SAVINGS_GOAL_MET":
                    // Rule: Spent <= Budget * Threshold (e.g. 0.8 for 20% savings)
                    if (totalLimit > 0 && totalSpent <= (totalLimit * badge.getThreshold())) {
                        eligible = true;
                    }
                    break;
            }

            // 3. Award if eligible
            if (eligible) {
                awardBadge(user, badge);
            }
        }
    }

    private void awardBadge(User user, String badgeCode) {
        badgeRepo.findByCode(badgeCode).ifPresent(b -> awardBadge(user, b));
    }

    private void awardBadge(User user, Badge badge) {
        if (!userBadgeRepo.existsByUserUserIdAndBadgeBadgeId(user.getUserId(), badge.getBadgeId())) {
            UserBadge ub = new UserBadge();
            ub.setUser(user);
            ub.setBadge(badge);
            userBadgeRepo.save(ub);

            // Notify
            Notification n = new Notification();
            n.setTitle("Badge Earned: " + badge.getName());
            n.setBody("You earned the " + badge.getName() + " badge!");
            n.setUser(user);
            n.setPriority("HIGH");
            notificationRepo.save(n);

            awardPoints(user.getUserId(), 50); // Bonus for badge
            logReward(user.getUserId(), "BADGE_EARNED", "Earned badge: " + badge.getName());
        }
    }

    private void logReward(Long userId, String action, String details) {
        RewardLog log = new RewardLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setDetails(details);
        logRepo.save(log);
    }
}
