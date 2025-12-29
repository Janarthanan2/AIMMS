package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.Feedback;
import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUser(User user);

    // For the admin feedback queue
    List<Feedback> findByStatus(Feedback.FeedbackStatus status);
}