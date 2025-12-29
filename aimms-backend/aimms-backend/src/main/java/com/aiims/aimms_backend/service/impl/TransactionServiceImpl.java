package com.aiims.aimms_backend.service.impl;

import com.aiims.aimms_backend.model.Transaction;
import com.aiims.aimms_backend.repository.TransactionRepository;
import com.aiims.aimms_backend.service.TransactionService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository repo;

    public TransactionServiceImpl(TransactionRepository repo) {
        this.repo = repo;
    }

    @Override
    public Transaction create(Transaction tx) {
        return repo.save(tx);
    }

    @Override
    public Optional<Transaction> findById(Long id) {
        return repo.findById(id);
    }

    @Override
    public List<Transaction> findByUserId(Long userId) {
        return repo.findAllByUserUserId(userId); // implement custom method if needed
    }

    @Override
    public Transaction update(Transaction tx) {
        return repo.save(tx);
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }
}

