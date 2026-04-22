package com.bytechat.features.user.repository;

import com.bytechat.features.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.workspaces w WHERE w.id = :workspaceId AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    java.util.List<User> searchInWorkspace(String workspaceId, String query);
}
