package com.aiims.aimms_backend.service.impl;

import com.aiims.aimms_backend.model.Feedback;
import com.aiims.aimms_backend.repository.FeedbackRepository;
import com.aiims.aimms_backend.service.FeedbackService;
import org.springframework.stereotype.Service;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    private final FeedbackRepository repo;
    public FeedbackServiceImpl(FeedbackRepository repo) { this.repo = repo; }
    @Override
    public Feedback logFeedback(Feedback f) {
        // TODO: call MLIntegrationService to send corrected label for retraining
        return repo.save(f);
    }
}
