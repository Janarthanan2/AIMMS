package com.aiims.aimms_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                // ✅ New lambda-based CSRF disable
                                .csrf(csrf -> csrf.disable())
                                .cors(Customizer.withDefaults()) // Enable CORS

                                // ✅ Allow all API endpoints without authentication (TEMPORARY - for
                                // development)
                                // TODO: Implement proper JWT-based authentication for production
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/**")
                                                .permitAll()
                                                .anyRequest().authenticated())

                                // ✅ (Optional) Basic auth for testing
                                .httpBasic(Customizer.withDefaults());

                // You can later add JWT filter here with:
                // .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                return http.build();
        }

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
                configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173", "http://localhost:5174"));
                configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(java.util.List.of("*"));
                configuration.setAllowCredentials(true);
                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
