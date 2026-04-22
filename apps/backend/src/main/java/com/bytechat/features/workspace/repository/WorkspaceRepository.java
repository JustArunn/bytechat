package com.bytechat.features.workspace.repository;

import com.bytechat.features.workspace.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, String> {
    Optional<Workspace> findByJoinCode(String joinCode);
    Optional<Workspace> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
