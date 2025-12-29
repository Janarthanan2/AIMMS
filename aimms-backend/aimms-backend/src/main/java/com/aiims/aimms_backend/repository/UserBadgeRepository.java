package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.User;
import com.aiims.aimms_backend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUser(User user);

    List<UserBadge> findByUserUserId(Long userId);

    boolean existsByUserUserIdAndBadgeBadgeId(Long userId, Long badgeId);
}