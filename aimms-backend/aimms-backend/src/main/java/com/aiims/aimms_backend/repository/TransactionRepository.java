package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.Transaction;
import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.time.LocalDateTime;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    List<Transaction> findByUserUserIdAndTxnDateBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<Transaction> findAllByUserUserId(Long userId);
}