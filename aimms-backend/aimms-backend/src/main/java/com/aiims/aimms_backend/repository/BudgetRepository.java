package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.Budget;
import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);

    List<Budget> findByUserUserId(Long userId);

    Optional<Budget> findByUserAndName(User user, String name);
}