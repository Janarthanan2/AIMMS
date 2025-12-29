package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long goalId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String goalName;

    @Column(nullable = false)
    private Double targetAmount;

    @Column(nullable = false)
    private Double currentAmount = 0.0;

    @Column
    private LocalDate deadline;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // getters/setters...
    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long id) {
        goalId = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User u) {
        user = u;
    }

    public String getGoalName() {
        return goalName;
    }

    public void setGoalName(String n) {
        goalName = n;
    }

    public Double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(Double a) {
        targetAmount = a;
    }

    public Double getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(Double a) {
        currentAmount = a;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate d) {
        deadline = d;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant t) {
        createdAt = t;
    }
}
