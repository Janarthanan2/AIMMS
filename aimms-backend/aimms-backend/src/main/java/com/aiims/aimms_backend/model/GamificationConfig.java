package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "gamification_config")
public class GamificationConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Budget Compliance Tolerance (e.g., 0.05 for 5% over budget allowed)
    @Column(nullable = false)
    private Double budgetTolerance = 0.0;

    // Savings Goal Threshold (e.g., 0.80 means must reach 80% of goal)
    @Column(nullable = false)
    private Double savingsGoalThreshold = 1.0;

    // Enabled Rewards
    @Column(nullable = false)
    private boolean budgetMasterEnabled = true;

    @Column(nullable = false)
    private boolean savingsGuruEnabled = true;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getBudgetTolerance() {
        return budgetTolerance;
    }

    public void setBudgetTolerance(Double budgetTolerance) {
        this.budgetTolerance = budgetTolerance;
    }

    public Double getSavingsGoalThreshold() {
        return savingsGoalThreshold;
    }

    public void setSavingsGoalThreshold(Double savingsGoalThreshold) {
        this.savingsGoalThreshold = savingsGoalThreshold;
    }

    public boolean isBudgetMasterEnabled() {
        return budgetMasterEnabled;
    }

    public void setBudgetMasterEnabled(boolean budgetMasterEnabled) {
        this.budgetMasterEnabled = budgetMasterEnabled;
    }

    public boolean isSavingsGuruEnabled() {
        return savingsGuruEnabled;
    }

    public void setSavingsGuruEnabled(boolean savingsGuruEnabled) {
        this.savingsGuruEnabled = savingsGuruEnabled;
    }
}
