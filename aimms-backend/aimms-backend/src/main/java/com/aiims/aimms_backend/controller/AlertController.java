package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Alert;
import com.aiims.aimms_backend.repository.AlertRepository;
import com.aiims.aimms_backend.service.AIAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository alertRepo;
    private final AIAlertService alertService;

    public AlertController(AlertRepository alertRepo, AIAlertService alertService) {
        this.alertRepo = alertRepo;
        this.alertService = alertService;
    }

    @GetMapping("/active")
    public List<Alert> getActiveAlerts() {
        return alertRepo.findByStatus(Alert.AlertStatus.ACTIVE);
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable Long id) {
        if (id == null)
            return ResponseEntity.badRequest().build();
        return alertRepo.findById(id).map(alert -> {
            alert.setStatus(Alert.AlertStatus.RESOLVED);
            alertRepo.save(alert);
            return ResponseEntity.ok(Map.of("message", "Alert resolved"));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Dev endpoint to trigger analysis manually
    @PostMapping("/trigger-analysis")
    public ResponseEntity<?> triggerAnalysis() {
        alertService.runAIAnalysis(); // Ensure this method is public in Service
        return ResponseEntity.ok(Map.of("message", "AI Analysis Triggered"));
    }
}
