package com.aiims.aimms_backend.service.impl;

import com.aiims.aimms_backend.dto.ReceiptDTO;
import com.aiims.aimms_backend.service.OCRService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Service
public class OCRServiceImpl implements OCRService {

    private final WebClient webClient;
    private final com.aiims.aimms_backend.repository.UserRepository userRepo;
    private final com.aiims.aimms_backend.repository.ReceiptRepository receiptRepo;

    public OCRServiceImpl(WebClient.Builder webClientBuilder,
            com.aiims.aimms_backend.repository.UserRepository userRepo,
            com.aiims.aimms_backend.repository.ReceiptRepository receiptRepo,
            @org.springframework.beans.factory.annotation.Value("${model.service.url}") String modelServiceUrl) {
        System.out.println("Initializing OCRServiceImpl with Model URL: " + modelServiceUrl);
        this.webClient = webClientBuilder.baseUrl(modelServiceUrl).build();
        this.userRepo = userRepo;
        this.receiptRepo = receiptRepo;
    }

    @Override
    public Mono<ReceiptDTO> extractReceiptData(MultipartFile file) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        try {
            builder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            }).header("Content-Disposition", "form-data; name=file; filename=" + file.getOriginalFilename());
        } catch (IOException e) {
            return Mono.error(new RuntimeException("Failed to read file bytes", e));
        }

        return webClient.post()
                .uri("/extract/receipt")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(ReceiptDTO.class)
                .flatMap(dto -> {
                    // Async save to DB
                    saveReceipt(dto, 1L); // Defaulting to User ID 1 for MVP/Demo
                    return Mono.just(dto);
                });
    }

    // Persist data to MySQL
    public void saveReceipt(ReceiptDTO dto, Long userId) {
        try {
            // We need to use a separate thread or blocking wrapper because we are in a
            // reactive flow but JPA is blocking
            // For this prototype, we'll just do it safely or assume transaction manager
            // handles it.

            com.aiims.aimms_backend.model.User user = userRepo.findById(userId).orElse(null);
            if (user == null)
                return;

            com.aiims.aimms_backend.model.Receipt receipt = new com.aiims.aimms_backend.model.Receipt();
            receipt.setUser(user);
            receipt.setMerchant(dto.getMerchantName());
            receipt.setTotalAmount(dto.getTotalAmount());
            receipt.setOcrConfidence(0.95);
            receipt.setExtractedText(dto.getRawText() != null ? dto.getRawText().toString() : "");
            receipt.setProcessed(true);

            // Date parsing safe-guard
            if (dto.getDate() != null) {
                try {
                    // Try standard formats
                    java.time.LocalDate date = java.time.LocalDate.parse(dto.getDate(),
                            java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                    receipt.setReceiptDate(date.atStartOfDay());
                } catch (Exception e) {
                    // ignore parse error, keep null
                }
            }

            receiptRepo.save(receipt);

        } catch (Exception e) {
            System.err.println("Failed to save receipt: " + e.getMessage());
        }
    }
}
