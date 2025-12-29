package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.dto.TransactionDTO;
import com.aiims.aimms_backend.model.*;
import com.aiims.aimms_backend.repository.CategoryRepository;
import com.aiims.aimms_backend.repository.TransactionRepository;
import com.aiims.aimms_backend.repository.UserRepository;
import com.aiims.aimms_backend.service.MLIntegrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionRepository txRepo;
    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;
    private final MLIntegrationService mlService;

    public TransactionController(TransactionRepository txRepo, UserRepository userRepo, CategoryRepository categoryRepo,
            MLIntegrationService mlService) {
        this.txRepo = txRepo;
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.mlService = mlService;
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getByUser(@PathVariable Long userId) {
        // implement custom repo method or filter
        return txRepo.findAllByUserUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> get(@PathVariable Long id) {
        return txRepo.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Transaction> create(@PathVariable Long userId, @RequestBody TransactionDTO dto) {
        User u = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        Transaction tx = new Transaction();
        tx.setUser(u);
        tx.setAmount(dto.getAmount());
        tx.setDescription(dto.getDescription());
        tx.setMerchant(dto.getMerchant());
        tx.setPaymentMode(dto.getPaymentMode());

        // Parse Date
        if (dto.getTxnDate() != null) {
            tx.setTxnDate(LocalDate.parse(dto.getTxnDate()).atStartOfDay());
        }

        // Handle Category
        if (dto.getCategory() != null) {
            categoryRepo.findByNameIgnoreCase(dto.getCategory()).ifPresent(tx::setCategory);
        }

        // call ML to predict category
        Map<String, Object> pred = mlService.predictCategory(tx);
        String predictedCat = (String) pred.get("category");
        tx.setPredictedCategory(predictedCat);
        tx.setConfidence(BigDecimal.valueOf(((Number) pred.getOrDefault("confidence", 0)).doubleValue()));

        // Auto-link Category if not manually set
        if (tx.getCategory() == null && predictedCat != null) {
            categoryRepo.findByNameIgnoreCase(predictedCat).ifPresent(tx::setCategory);
        }

        Transaction saved = txRepo.save(tx);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable Long id, @RequestBody Transaction tx) {
        return txRepo.findById(id).map(existing -> {
            existing.setAmount(tx.getAmount());
            existing.setDescription(tx.getDescription());
            existing.setMerchant(tx.getMerchant());
            existing.setTxnDate(tx.getTxnDate());
            existing.setCategory(tx.getCategory());
            Transaction updated = txRepo.save(existing);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        txRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
