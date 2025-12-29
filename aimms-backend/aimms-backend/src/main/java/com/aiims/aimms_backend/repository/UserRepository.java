package com.aiims.aimms_backend.repository;

import com.aiims.aimms_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT MAX(u.userId) FROM User u")
    Long findMaxUserId();

    @Query("SELECT u.userId FROM User u ORDER BY u.userId")
    List<Long> findAllUserIds();
}
