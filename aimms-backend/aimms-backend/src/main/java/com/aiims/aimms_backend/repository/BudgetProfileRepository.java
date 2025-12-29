package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.BudgetProfile;
import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetProfileRepository extends JpaRepository<BudgetProfile, Long> {
    Optional<BudgetProfile> findByUser(User user);
}
