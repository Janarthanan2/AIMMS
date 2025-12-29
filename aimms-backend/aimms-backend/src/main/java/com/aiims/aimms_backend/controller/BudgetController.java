package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Budget;
import com.aiims.aimms_backend.repository.BudgetRepository;
import com.aiims.aimms_backend.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepo;
    private final com.aiims.aimms_backend.repository.BudgetProfileRepository profileRepo;
    private final com.aiims.aimms_backend.repository.UserRepository userRepo;
    private final com.aiims.aimms_backend.repository.CategoryRepository categoryRepo;
    private final com.aiims.aimms_backend.repository.TransactionRepository transactionRepo;

    public BudgetController(BudgetRepository budgetRepo,
            com.aiims.aimms_backend.repository.BudgetProfileRepository profileRepo,
            com.aiims.aimms_backend.repository.UserRepository userRepo,
            com.aiims.aimms_backend.repository.CategoryRepository categoryRepo,
            com.aiims.aimms_backend.repository.TransactionRepository transactionRepo) {
        this.budgetRepo = budgetRepo;
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.transactionRepo = transactionRepo;
    }

    @GetMapping("/user/{userId}")
    public List<Budget> list(@PathVariable Long userId) {
        com.aiims.aimms_backend.model.User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            return List.of();

        List<Budget> budgets = budgetRepo.findByUser(user);
        List<com.aiims.aimms_backend.model.Transaction> transactions = transactionRepo.findAllByUserUserId(userId);

        java.time.YearMonth currentMonth = java.time.YearMonth.now();

        // Calculate current spending for each budget
        for (Budget b : budgets) {
            double spent = transactions.stream()
                    .filter(t -> t.getTxnDate() != null
                            && java.time.YearMonth.from(t.getTxnDate()).equals(currentMonth))
                    .filter(t -> {
                        String catName = t.getCategory() != null ? t.getCategory().getName() : t.getPredictedCategory();
                        return catName != null && catName.equalsIgnoreCase(b.getName());
                    })
                    .mapToDouble(com.aiims.aimms_backend.model.Transaction::getAmount)
                    .sum();
            b.setCurrentAmount(spent);
        }

        return budgets;
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<com.aiims.aimms_backend.model.BudgetProfile> getProfile(@PathVariable Long userId) {
        com.aiims.aimms_backend.model.User user = userRepo.findById(userId).orElseThrow();
        return profileRepo.findByUser(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/onboarding/{userId}")
    public ResponseEntity<?> saveOnboarding(@PathVariable Long userId,
            @RequestBody com.aiims.aimms_backend.dto.BudgetOnboardingRequest request) {
        com.aiims.aimms_backend.model.User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Save Budget Profile
        com.aiims.aimms_backend.model.BudgetProfile profile = profileRepo.findByUser(user)
                .orElse(new com.aiims.aimms_backend.model.BudgetProfile());

        profile.setUser(user);
        profile.setMonthlyIncome(request.getMonthlyIncome());
        profile.setSavingsTarget(request.getSavingsTarget());

        // Sum fixed expenses
        double fixedTotal = request.getFixedExpenses().values().stream().mapToDouble(Double::doubleValue).sum();
        profile.setFixedExpensesAmount(fixedTotal);
        profile.setFixedExpensesDescription(request.getFixedExpenses().toString());
        profile.setAlertThresholds(String.join(",", request.getAlertThresholds()));
        profile.setUpdatedAt(java.time.Instant.now());

        profileRepo.save(profile);

        // 2. Save Category Budgets
        request.getCategoryLimits().forEach((catName, limit) -> {
            Budget budget = budgetRepo.findByUserAndName(user, catName)
                    .orElse(new Budget());

            if (budget.getUser() == null) {
                budget.setUser(user);
                budget.setName(catName);
                budget.setCurrentAmount(0.0);
                budget.setCreatedAt(java.time.Instant.now());
            }
            budget.setLimitAmount(limit);
            budgetRepo.save(budget);
        });

        return ResponseEntity.ok(profile);
    }
}
