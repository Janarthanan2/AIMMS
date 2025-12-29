package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.RewardLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RewardLogRepository extends JpaRepository<RewardLog, Long> {
    List<RewardLog> findTop50ByOrderByTimestampDesc();
}
