package com.aiims.aimms_backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class BudgetOnboardingRequest {
    private Double monthlyIncome;
    private Double savingsTarget;
    private Map<String, Double> fixedExpenses; // "Rent" -> 15000
    private Map<String, Double> categoryLimits; // "Food" -> 5000
    private List<String> alertThresholds; // ["50", "80"]
}
