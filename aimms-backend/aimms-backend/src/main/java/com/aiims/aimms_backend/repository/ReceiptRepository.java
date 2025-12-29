package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.Receipt;
import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByUser(User user);

    List<Receipt> findByUserUserId(Long userId);

    List<Receipt> findByUserUserIdOrderByReceiptDateDesc(Long userId);
}