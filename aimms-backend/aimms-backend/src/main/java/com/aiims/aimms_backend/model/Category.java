package com.aiims.aimms_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String type = "EXPENSE"; // EXPENSE / INCOME

    // getters/setters
    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long id) {
        categoryId = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String n) {
        name = n;
    }

    public String getType() {
        return type;
    }

    public void setType(String t) {
        type = t;
    }
}
