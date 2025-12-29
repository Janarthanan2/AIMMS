package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.Transaction;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class MLIntegrationServiceImpl implements MLIntegrationService {

    private final ModelClientService modelClientService;

    public MLIntegrationServiceImpl(ModelClientService modelClientService) {
        this.modelClientService = modelClientService;
    }

    @Override
    public Map<String, Object> predictCategory(Transaction tx) {
        // Call the Python micro‑service with the transaction description
        // The service returns a JSON map like {"category": "Food", "confidence": 0.97}
        // We block here for simplicity; in a real app you might make this reactive.
        return modelClientService.classify(tx.getDescription())
                .block(); // block to get the Map synchronously
    }

    @Override
    public void sendFeedbackForRetrain(Map<String, Object> feedback) {
        // Placeholder – could POST feedback to a retraining endpoint later
    }

    @Override
    public Map<String, Object> goalImpactSimulation(Long userId, Double transactionAmount) {
        // Placeholder – not implemented yet
        return Map.of();
    }
}
