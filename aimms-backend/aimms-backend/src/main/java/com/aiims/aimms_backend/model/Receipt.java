package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "receipts")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long receiptId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @Column(nullable = false)
    private String imagePath; // storage URL / path

    @Lob
    private String extractedText;

    @Column
    private String merchant;

    @Column
    private Double totalAmount;

    @Column
    private LocalDateTime receiptDate;

    @Column
    private Double ocrConfidence;

    @Column(nullable = false)
    private Boolean processed = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // getters/setters ...
    public Long getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(Long id) {
        receiptId = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User u) {
        user = u;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public void setTransaction(Transaction t) {
        transaction = t;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String p) {
        imagePath = p;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String t) {
        extractedText = t;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String m) {
        merchant = m;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double a) {
        totalAmount = a;
    }

    public LocalDateTime getReceiptDate() {
        return receiptDate;
    }

    public void setReceiptDate(LocalDateTime d) {
        receiptDate = d;
    }

    public Double getOcrConfidence() {
        return ocrConfidence;
    }

    public void setOcrConfidence(Double c) {
        ocrConfidence = c;
    }

    public Boolean getProcessed() {
        return processed;
    }

    public void setProcessed(Boolean p) {
        processed = p;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant t) {
        createdAt = t;
    }
}
