package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByName(String name);

    Optional<Badge> findByCode(String code);

    List<Badge> findByActiveTrue();
}