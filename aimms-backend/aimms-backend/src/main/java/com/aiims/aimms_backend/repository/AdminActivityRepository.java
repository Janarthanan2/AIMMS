package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.Admin;
import com.aiims.aimms_backend.model.AdminActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminActivityRepository extends JpaRepository<AdminActivity, Long> {
    List<AdminActivity> findByAdmin(Admin admin);
}