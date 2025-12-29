package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subscriptionId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column
    private String merchant;

    @Column
    private Double amount;

    @Column
    private String frequency; // DAILY/WEEKLY/MONTHLY/YEARLY

    @Column
    private LocalDate nextPaymentDate;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // getters/setters...
    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long id) {
        subscriptionId = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User u) {
        user = u;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String m) {
        merchant = m;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double a) {
        amount = a;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String f) {
        frequency = f;
    }

    public LocalDate getNextPaymentDate() {
        return nextPaymentDate;
    }

    public void setNextPaymentDate(LocalDate d) {
        nextPaymentDate = d;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant t) {
        createdAt = t;
    }
}
