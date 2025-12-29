package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.UserFeedback;
import com.aiims.aimms_backend.service.UserFeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class UserFeedbackController {

    private final UserFeedbackService feedbackService;

    public UserFeedbackController(UserFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/submit/{userId}")
    public ResponseEntity<UserFeedback> submit(@PathVariable Long userId, @RequestBody UserFeedback feedback) {
        return ResponseEntity.ok(feedbackService.submitFeedback(userId, feedback));
    }

    @GetMapping("/user/{userId}")
    public List<UserFeedback> getUserFeedback(@PathVariable Long userId) {
        return feedbackService.getUserFeedbackHistory(userId);
    }

    @GetMapping("/all")
    public List<UserFeedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserFeedback> updateStatus(
            @PathVariable Long id,
            @RequestParam UserFeedback.FeedbackStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(feedbackService.updateStatus(id, status, remarks));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
