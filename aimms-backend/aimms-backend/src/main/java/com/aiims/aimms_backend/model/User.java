package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_users")
public class User {
    @Id
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "role_ENUM")
    private Role role = Role.USER;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // Gamification
    private int points = 0;
    private String level = "ROOKIE"; // ROOKIE, BRONZE, SILVER, GOLD, PLATINUM

    // getters / setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long id) {
        this.userId = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String s) {
        name = s;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String s) {
        email = s;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String s) {
        passwordHash = s;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String p) {
        phone = p;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant t) {
        createdAt = t;
    }

    public Role getRole() {
        return role;
    }

    // Role is always USER for app_users table - cannot be changed
    private void setRole(Role role) {
        this.role = Role.USER;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}
