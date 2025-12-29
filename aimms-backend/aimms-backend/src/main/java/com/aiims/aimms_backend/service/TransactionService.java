package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.Transaction;
import java.util.List;
import java.util.Optional;

public interface TransactionService {
    Transaction create(Transaction tx);
    Optional<Transaction> findById(Long id);
    List<Transaction> findByUserId(Long userId);
    Transaction update(Transaction tx);
    void delete(Long id);
}

