package com.aiims.aimms_backend.config;

import com.aiims.aimms_backend.model.Badge;
import com.aiims.aimms_backend.repository.BadgeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BadgeInitializer {

    @Bean
    public CommandLineRunner initBadges(BadgeRepository repo) {
        return args -> {
            createBadgeIfNotFound(repo, "BUDGET_MASTER", "Budget Master", "Stayed under budget for a month");
            createBadgeIfNotFound(repo, "SAVINGS_GURU", "Savings Guru", "Saved more than 20% of your budget");
            createBadgeIfNotFound(repo, "GOAL_GETTER", "Goal Getter", "Achieved a financial goal");
            createBadgeIfNotFound(repo, "STREAK_KEEPER", "Streak Keeper", "Login for 7 consecutive days");
        };
    }

    private void createBadgeIfNotFound(BadgeRepository repo, String code, String name, String desc) {
        if (repo.findByCode(code).isEmpty()) {
            Badge b = new Badge();
            b.setCode(code);
            b.setName(name);
            b.setDescription(desc);
            repo.save(b);
            System.out.println("Initialized Badge: " + name);
        }
    }
}
