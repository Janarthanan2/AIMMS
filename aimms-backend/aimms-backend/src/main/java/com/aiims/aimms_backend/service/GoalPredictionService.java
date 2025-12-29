package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.dto.GoalPredictionResponse;
import reactor.core.publisher.Mono;

public interface GoalPredictionService {
    Mono<GoalPredictionResponse> predictGoalCompletion(Long goalId, Long userId);
}
