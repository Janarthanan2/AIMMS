package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.Transaction;
import java.util.Map;

public interface MLIntegrationService {
    Map<String, Object> predictCategory(Transaction tx);
    void sendFeedbackForRetrain(Map<String, Object> feedback);
    Map<String,Object> goalImpactSimulation(Long userId, Double transactionAmount);
}
