package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.UserFeedback;
import com.aiims.aimms_backend.model.User;
import com.aiims.aimms_backend.repository.UserFeedbackRepository;
import com.aiims.aimms_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserFeedbackService {

    private final UserFeedbackRepository feedbackRepo;
    private final UserRepository userRepo;

    public UserFeedbackService(UserFeedbackRepository feedbackRepo, UserRepository userRepo) {
        this.feedbackRepo = feedbackRepo;
        this.userRepo = userRepo;
    }

    public UserFeedback submitFeedback(Long userId, UserFeedback feedback) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        feedback.setUser(user);
        return feedbackRepo.save(feedback);
    }

    public List<UserFeedback> getUserFeedbackHistory(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("User ID cannot be null");
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return feedbackRepo.findByUserOrderByTimestampDesc(user);
    }

    public List<UserFeedback> getAllFeedback() {
        return feedbackRepo.findAllByOrderByTimestampDesc();
    }

    public UserFeedback updateStatus(Long feedbackId, UserFeedback.FeedbackStatus status, String remarks) {
        if (feedbackId == null)
            throw new IllegalArgumentException("Feedback ID cannot be null");
        UserFeedback feedback = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setStatus(status);
        if (remarks != null) {
            feedback.setAdminRemarks(remarks);
        }
        return feedbackRepo.save(feedback);
    }

    public void deleteFeedback(Long feedbackId) {
        if (feedbackId == null)
            throw new IllegalArgumentException("Feedback ID cannot be null");
        if (!feedbackRepo.existsById(feedbackId))
            throw new RuntimeException("Feedback not found");
        feedbackRepo.deleteById(feedbackId);
    }
}
