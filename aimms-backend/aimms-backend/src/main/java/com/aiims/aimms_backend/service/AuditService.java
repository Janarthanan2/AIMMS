package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.AuditLog;
import com.aiims.aimms_backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditLogRepository auditRepo;

    public AuditService(AuditLogRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    public void log(String action, String details, Long actorId) {
        AuditLog log = new AuditLog(action, details, actorId);
        auditRepo.save(log);
    }
}
