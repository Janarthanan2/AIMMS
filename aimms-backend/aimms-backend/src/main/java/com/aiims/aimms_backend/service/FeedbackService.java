package com.aiims.aimms_backend.service;

import com.aiims.aimms_backend.model.Feedback;

public interface FeedbackService {
    Feedback logFeedback(Feedback feedback);
}
