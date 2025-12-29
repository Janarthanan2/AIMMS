package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long budgetId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double limitAmount;

    @Column(nullable = false)
    private Double currentAmount = 0.0;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // getters/setters...
    public Long getBudgetId() {
        return budgetId;
    }

    public void setBudgetId(Long id) {
        budgetId = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User u) {
        user = u;
    }

    public String getName() {
        return name;
    }

    public void setName(String n) {
        name = n;
    }

    public Double getLimitAmount() {
        return limitAmount;
    }

    public void setLimitAmount(Double d) {
        limitAmount = d;
    }

    public Double getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(Double d) {
        currentAmount = d;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant t) {
        createdAt = t;
    }
}
