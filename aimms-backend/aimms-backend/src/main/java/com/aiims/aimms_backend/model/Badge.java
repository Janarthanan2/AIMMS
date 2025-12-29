package com.aiims.aimms_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long badgeId;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    // TOTAL_BUDGET_PERCENT, SAVINGS_GOAL_MET
    @Column(name = "rule_type")
    private String ruleType = "TOTAL_BUDGET_PERCENT";

    // e.g. 1.0 (100% budget), 0.8 (80% spending)
    @Column(nullable = false)
    private Double threshold = 1.0;

    @Column
    private String icon = "🏅";

    // getters/setters...
    public Long getBadgeId() {
        return badgeId;
    }

    public void setBadgeId(Long id) {
        badgeId = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String c) {
        code = c;
    }

    public String getName() {
        return name;
    }

    public void setName(String n) {
        name = n;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String d) {
        description = d;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public Double getThreshold() {
        return threshold;
    }

    public void setThreshold(Double threshold) {
        this.threshold = threshold;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
