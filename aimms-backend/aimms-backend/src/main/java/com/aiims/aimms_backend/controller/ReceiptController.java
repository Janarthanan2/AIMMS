package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.model.Receipt;
import com.aiims.aimms_backend.repository.ReceiptRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptRepository receiptRepository;

    public ReceiptController(ReceiptRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    @GetMapping
    public List<Receipt> getAllReceipts() {
        return receiptRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Receipt> getUserReceipts(@PathVariable Long userId) {
        return receiptRepository.findByUserUserIdOrderByReceiptDateDesc(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Receipt> getReceiptById(@PathVariable Long id) {
        return receiptRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
