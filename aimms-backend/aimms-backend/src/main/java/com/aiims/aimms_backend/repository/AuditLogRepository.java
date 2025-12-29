package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
