package com.bytechat.features.workspace.repository;

import com.bytechat.features.workspace.model.WorkspaceInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WorkspaceInviteRepository extends JpaRepository<WorkspaceInvite, String> {
    Optional<WorkspaceInvite> findByEmailAndWorkspaceIdAndAccepted(String email, String workspaceId, boolean accepted);
    boolean existsByEmailAndWorkspaceIdAndAccepted(String email, String workspaceId, boolean accepted);
    java.util.List<WorkspaceInvite> findByEmailAndAccepted(String email, boolean accepted);
}
