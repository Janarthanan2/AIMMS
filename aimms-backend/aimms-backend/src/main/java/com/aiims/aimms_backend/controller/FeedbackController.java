package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Feedback;
import com.aiims.aimms_backend.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    private final FeedbackService service;
    public FeedbackController(FeedbackService service) { this.service = service; }

    @PostMapping("/add")
    public ResponseEntity<Feedback> add(@RequestBody Feedback f) {
        Feedback saved = service.logFeedback(f);
        return ResponseEntity.ok(saved);
    }
}
