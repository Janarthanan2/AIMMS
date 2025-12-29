package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_badges")
public class UserBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(nullable = false)
    private Instant awardedAt = Instant.now();

    // getters/setters...
    public Long getId() {
        return id;
    }

    public void setId(Long i) {
        id = i;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User u) {
        user = u;
    }

    public Badge getBadge() {
        return badge;
    }

    public void setBadge(Badge b) {
        badge = b;
    }

    public Instant getAwardedAt() {
        return awardedAt;
    }

    public void setAwardedAt(Instant t) {
        awardedAt = t;
    }
}
