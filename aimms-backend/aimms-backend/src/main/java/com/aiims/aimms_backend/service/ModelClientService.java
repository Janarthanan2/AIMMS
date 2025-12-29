package com.aiims.aimms_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Objects;

@Service
public class ModelClientService {

    private final WebClient webClient;

    public ModelClientService(WebClient.Builder webClientBuilder,
            @org.springframework.beans.factory.annotation.Value("${model.service.url}") String modelServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(Objects.requireNonNull(modelServiceUrl)).build();
    }

    public Mono<Map<String, Object>> classify(String description) {
        return this.webClient.post()
                .uri("/predict")
                .bodyValue(Map.of("description", description))
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Object>) map);
    }
}
