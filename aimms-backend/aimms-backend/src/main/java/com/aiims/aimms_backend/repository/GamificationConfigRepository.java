package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.GamificationConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GamificationConfigRepository extends JpaRepository<GamificationConfig, Long> {
}
