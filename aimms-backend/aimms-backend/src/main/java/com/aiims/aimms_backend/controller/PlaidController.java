package com.aiims.aimms_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plaid")
public class PlaidController {
    // This is a placeholder: attach bank / third-party connector here
    @PostMapping("/link-token")
    public ResponseEntity<String> getLinkToken() {
        // TODO: integrate Plaid or other provider
        return ResponseEntity.ok("{\"link_token\":\"demo\"}");
    }
}
