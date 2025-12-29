package com.aiims.aimms_backend.controller;

import com.aiims.aimms_backend.dto.ReceiptDTO;
import com.aiims.aimms_backend.service.OCRService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class OCRController {

    private final OCRService ocrService;

    public OCRController(OCRService ocrService) {
        this.ocrService = ocrService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public Mono<ResponseEntity<ReceiptDTO>> uploadReceipt(@RequestParam("file") MultipartFile file) {
        return ocrService.extractReceiptData(file)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.badRequest().build());
    }
}
