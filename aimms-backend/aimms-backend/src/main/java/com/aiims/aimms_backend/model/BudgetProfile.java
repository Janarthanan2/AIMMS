package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "budget_profiles")
@Data
public class BudgetProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "userId", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double monthlyIncome;

    @Column(nullable = false)
    private Double fixedExpensesAmount;

    @Column(nullable = false)
    private Double savingsTarget;

    // JSON string or delimited string to store detailed fixed expenses if needed
    // later
    // For now, we store the total as per requirement, but let's add a description
    // field just in case
    @Column(length = 1000)
    private String fixedExpensesDescription; // e.g., "Rent: 15000, Netflix: 500"

    @Column(length = 50)
    private String alertThresholds; // "50,80,100"

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}
