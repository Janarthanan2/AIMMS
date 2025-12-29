package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Added back: Required by FeedbackRepository.findByUser

    @ManyToOne // Changed from @OneToOne for flexibility
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column
    private String oldCategory;

    @Column
    private String correctedCategory;

    @Column(nullable = false)
    private Instant feedbackDate = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackStatus status = FeedbackStatus.PENDING; // Added back: Fixes the error

    /**
     * Enum to track the state of the feedback for the admin approval queue.
     * This is what was causing the "Cannot resolve symbol" error.
     */
    public enum FeedbackStatus {
        PENDING, // Awaiting admin review
        APPROVED, // Admin approved, can be sent to ML model
        REJECTED // Admin rejected
    }

    // getters / setters
    public Long getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Long id) {
        feedbackId = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public void setTransaction(Transaction t) {
        transaction = t;
    }

    public String getOldCategory() {
        return oldCategory;
    }

    public void setOldCategory(String s) {
        oldCategory = s;
    }

    public String getCorrectedCategory() {
        return correctedCategory;
    }

    public void setCorrectedCategory(String s) {
        correctedCategory = s;
    }

    public Instant getFeedbackDate() {
        return feedbackDate;
    }

    public void setFeedbackDate(Instant d) {
        feedbackDate = d;
    }

    public FeedbackStatus getStatus() {
        return status;
    }

    public void setStatus(FeedbackStatus status) {
        this.status = status;
    }
}