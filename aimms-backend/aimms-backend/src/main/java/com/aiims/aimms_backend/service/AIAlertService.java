package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.Alert;
import com.aiims.aimms_backend.repository.AlertRepository;
import com.aiims.aimms_backend.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class AIAlertService {

    private final AlertRepository alertRepo;
    private final Random random = new Random();

    public AIAlertService(AlertRepository alertRepo, UserRepository userRepo) {
        this.alertRepo = alertRepo;
        // this.userRepo = userRepo; // Kept for future extension but suppress warning
        // by removing field usage if needed, or better, just leave it as I might use it
        // later.
        // Actually, to fix lint, I should remove the field if I don't use it.
    }

    // Run every 5 minutes (300000 ms)
    @Scheduled(fixedRate = 300000)
    public void runAIAnalysis() {
        System.out.println("🤖 AI Alert System: Starting analysis cycle...");
        analyzeFinancialRisks();
        monitorSystemHealth();
        monitorModelperformance();
    }

    private void analyzeFinancialRisks() {
        // Heuristic: Check for budget breaches (Simulated for Demo)
        // In real app: Fetch all budgets, calculate burn rate vs days remaining.

        // Simulating a High Risk Alert
        if (random.nextDouble() > 0.7) { // 30% chance per cycle
            createAlert(
                    Alert.AlertType.FINANCIAL,
                    Alert.AlertSeverity.HIGH,
                    "Projected Overspending Detected for 12 Users",
                    "AI analysis of spending velocity indicates that 12 users are on track to exceed their 'Food & Dining' budgets by Day 25. Recommended action: Send cautionary push notification.",
                    89);
        }
    }

    private void monitorSystemHealth() {
        // Simulating API Latency Spike
        if (random.nextDouble() > 0.85) {
            createAlert(
                    Alert.AlertType.SYSTEM,
                    Alert.AlertSeverity.MEDIUM,
                    "Unusual API Latency Pattern",
                    "Anomaly detection algorithms noticed a 45% increase in response time for /transactions/create endpoint between 02:00 and 02:15 UTC.",
                    92);
        }
    }

    private void monitorModelperformance() {
        // Simulating Model Drift
        if (random.nextDouble() > 0.95) {
            createAlert(
                    Alert.AlertType.MODEL,
                    Alert.AlertSeverity.LOW,
                    "Categorization Model Confidence Drop",
                    "The transaction categorization model's average confidence score has dropped from 94% to 87% over the last 24 hours. Retraining may be required.",
                    76);
        }
    }

    public void createAlert(Alert.AlertType type, Alert.AlertSeverity severity, String message, String explanation,
            int confidence) {
        // Prevent duplicate spam: Check if similar active alert exists
        List<Alert> active = alertRepo.findByStatus(Alert.AlertStatus.ACTIVE);
        boolean exists = active.stream().anyMatch(a -> a.getMessage().equals(message));

        if (!exists) {
            Alert alert = new Alert();
            alert.setType(type);
            alert.setSeverity(severity);
            alert.setMessage(message);
            alert.setAiExplanation(explanation);
            alert.setConfidenceScore(confidence);
            alert.setTimestamp(LocalDateTime.now());
            alertRepo.save(alert);
            System.out.println("🚨 New Alert Generated: " + message);
        }
    }
}
