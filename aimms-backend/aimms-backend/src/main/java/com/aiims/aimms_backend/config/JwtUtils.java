package com.aiims.aimms_backend.config;

import org.springframework.stereotype.Component;

/**
 * TODO: implement JWT utilities to create/validate tokens.
 */
@Component
public class JwtUtils {
    private final String jwtSecret = "qwertyuiopasdfghjklzxcvbnm";
    private final long jwtExpirationMs = 3600000L;
    // Add methods to generate/validate token
}
