package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Subscription;
import com.aiims.aimms_backend.repository.SubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {
    private final SubscriptionRepository repo;
    public SubscriptionController(SubscriptionRepository repo) { this.repo = repo; }

    @GetMapping("/user/{userId}")
    public List<Subscription> list(@PathVariable Long userId) {
        return repo.findAll(); // TODO filter
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Subscription> create(@PathVariable Long userId, @RequestBody Subscription s) {
        Subscription saved = repo.save(s);
        return ResponseEntity.ok(saved);
    }
}
