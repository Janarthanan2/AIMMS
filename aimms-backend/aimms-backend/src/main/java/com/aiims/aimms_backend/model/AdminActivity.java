package com.aiims.aimms_backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "admin_activities")
public class AdminActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long activityId;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @Column(nullable = false)
    private String action;

    @Column
    private String targetTable;

    @Column
    private Long targetId;

    @Lob
    private String description;

    @Column(nullable = false)
    private Instant activityTime = Instant.now();

    // getters/setters...
    public Long getActivityId() {
        return activityId;
    }

    public void setActivityId(Long id) {
        activityId = id;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin a) {
        admin = a;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String s) {
        action = s;
    }

    public String getTargetTable() {
        return targetTable;
    }

    public void setTargetTable(String t) {
        targetTable = t;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long id) {
        targetId = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String d) {
        description = d;
    }

    public Instant getActivityTime() {
        return activityTime;
    }

    public void setActivityTime(Instant t) {
        activityTime = t;
    }
}
