package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Budget;
import com.aiims.aimms_backend.model.User;
import com.aiims.aimms_backend.repository.BudgetRepository;
import com.aiims.aimms_backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class BudgetRecommendationController {

    private final BudgetRepository budgetRepo;
    private final UserRepository userRepo;

    public BudgetRecommendationController(BudgetRepository budgetRepo, UserRepository userRepo) {
        this.budgetRepo = budgetRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/{userId}")
    public List<String> getRecommendations(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Budget> budgets = budgetRepo.findByUser(user);
        List<String> recommendations = new ArrayList<>();

        for (Budget b : budgets) {
            double limit = b.getLimitAmount();
            double spent = b.getCurrentAmount() != null ? b.getCurrentAmount() : 0.0;
            double percent = (spent / limit) * 100;
            double remaining = limit - spent;

            if (percent > 90 && percent < 100) {
                recommendations.add("⚠️ Critical: You have nearly exhausted your **" + b.getName() + "** budget. Only ₹"
                        + (int) remaining + " remaining.");
            } else if (percent > 100) {
                recommendations.add("🚨 Overspending: You exceeded **" + b.getName() + "** by ₹" + (int) (spent - limit)
                        + ". Try to cut back on discretionary spending next week.");
            } else if (percent > 50 && b.getName().equalsIgnoreCase("Food")) { // Targeted advice
                recommendations.add("💡 Tip: You've spent " + (int) percent
                        + "% of your **Food** budget. Consider cooking at home this weekend to save ₹500.");
            } else if (remaining > 5000 && percent < 20) {
                recommendations.add("🌟 Great Job: You have significant savings in **" + b.getName()
                        + "**. Consider moving ₹" + (int) (remaining / 2) + " to your Savings Goal.");
            }
        }

        if (recommendations.isEmpty()) {
            recommendations.add("✅ You are on track! No critical alerts this week. Keep up the good work.");
        }

        return recommendations;
    }
}
