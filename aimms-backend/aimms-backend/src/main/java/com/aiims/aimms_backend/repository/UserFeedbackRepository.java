package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.UserFeedback;
import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {
    List<UserFeedback> findByUserOrderByTimestampDesc(User user);

    List<UserFeedback> findAllByOrderByTimestampDesc();
}
