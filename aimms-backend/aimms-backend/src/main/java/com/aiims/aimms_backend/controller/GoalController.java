package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Goal;
import com.aiims.aimms_backend.repository.GoalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository repo;
    private final com.aiims.aimms_backend.service.GoalPredictionService predictionService;
    private final com.aiims.aimms_backend.repository.UserRepository userRepo; // Needed to fix create

    public GoalController(GoalRepository repo,
            com.aiims.aimms_backend.service.GoalPredictionService predictionService,
            com.aiims.aimms_backend.repository.UserRepository userRepo) {
        this.repo = repo;
        this.predictionService = predictionService;
        this.userRepo = userRepo;
    }

    @GetMapping("/user/{userId}")
    public List<Goal> list(@PathVariable Long userId) {
        com.aiims.aimms_backend.model.User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            return List.of();
        return repo.findByUser(user);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Goal> create(@PathVariable Long userId, @RequestBody Goal goal) {
        com.aiims.aimms_backend.model.User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        goal.setUser(user);
        Goal saved = repo.save(goal);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> update(@PathVariable Long id, @RequestBody Goal goalDetails) {
        return repo.findById(id).map(goal -> {
            goal.setGoalName(goalDetails.getGoalName());
            goal.setTargetAmount(goalDetails.getTargetAmount());
            goal.setCurrentAmount(goalDetails.getCurrentAmount());
            goal.setDeadline(goalDetails.getDeadline());
            return ResponseEntity.ok(repo.save(goal));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{goalId}/prediction")
    public reactor.core.publisher.Mono<ResponseEntity<com.aiims.aimms_backend.dto.GoalPredictionResponse>> predictReference(
            @PathVariable Long goalId,
            @RequestParam Long userId) {
        return predictionService.predictGoalCompletion(goalId, userId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
