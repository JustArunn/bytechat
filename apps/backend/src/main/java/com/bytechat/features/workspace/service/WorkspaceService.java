package com.bytechat.features.workspace.service;

import com.bytechat.features.workspace.dto.WorkspaceRequest;
import com.bytechat.features.workspace.dto.WorkspaceResponse;
import com.bytechat.features.user.dto.UserResponse;
import com.bytechat.exception.ResourceNotFoundException;
import com.bytechat.exception.UnauthorizedException;
import com.bytechat.features.user.model.User;
import com.bytechat.features.workspace.model.Workspace;
import com.bytechat.features.workspace.model.WorkspaceInvite;
import com.bytechat.features.workspace.dto.WorkspaceInviteResponse;
import com.bytechat.features.user.repository.UserRepository;
import com.bytechat.features.workspace.repository.WorkspaceRepository;
import com.bytechat.features.workspace.repository.WorkspaceInviteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bytechat.features.message.dto.ChatEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceInviteRepository workspaceInviteRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        // Refresh user from DB to avoid session issues
        User user = userRepository.findById(Objects.requireNonNull(currentUser.getId())).orElseThrow();

        if (workspaceRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Workspace with slug '" + request.getSlug() + "' already exists");
        }

        Workspace workspace = Objects.requireNonNull(Workspace.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .joinCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .adminId(user.getId())
                .build());

        workspace.getMembers().add(user);
        Workspace savedWorkspace = Objects.requireNonNull(workspaceRepository.save(workspace));

        user.getWorkspaces().add(savedWorkspace);
        userRepository.save(user);

        return mapToResponse(savedWorkspace);
    }

    public List<WorkspaceResponse> getUserWorkspaces() {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        User user = userRepository.findById(Objects.requireNonNull(currentUser.getId())).orElseThrow();

        return user.getWorkspaces().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceResponse joinWorkspace(String joinCode) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        User user = userRepository.findById(Objects.requireNonNull(currentUser.getId())).orElseThrow();

        Workspace workspace = workspaceRepository.findByJoinCode(Objects.requireNonNull(joinCode))
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with join code: " + joinCode));

        if (workspace.getMembers().contains(user)) {
            return mapToResponse(workspace);
        }

        workspace.getMembers().add(user);
        user.getWorkspaces().add(workspace);

        workspaceRepository.save(workspace);
        userRepository.save(user);

        // Notify all workspace members about new user
        UserResponse userResponse = mapUserToResponse(user);
        workspace.getMembers().forEach(member -> {
            messagingTemplate.convertAndSendToUser(
                Objects.requireNonNull(member.getEmail()), 
                "/queue/notifications", 
                Objects.requireNonNull(ChatEvent.builder()
                    .type(ChatEvent.EventType.MEMBER_JOINED)
                    .conversationId(workspace.getId())
                    .workspaceSlug(workspace.getSlug())
                    .senderId(user.getId())

                    .senderName(user.getFullName())
                    .content(userResponse)
                    .build())


            );
        });

        return mapToResponse(workspace);
    }


    public WorkspaceResponse getPublicWorkspaceById(String id) {
        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(id))
                .orElseGet(() -> workspaceRepository.findBySlug(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Workspace not found")));

        return Objects.requireNonNull(WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .build());
    }

    @Transactional
    public void inviteUser(String workspaceId, String email) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(workspaceId))
                .orElseGet(() -> workspaceRepository.findBySlug(workspaceId)
                        .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId)));

        if (!workspace.isAdminOrCoAdmin(currentUser.getId())) {
            throw new UnauthorizedException("Only admins can invite users");
        }

        String normalizedEmail = email.toLowerCase().trim();
        if (workspaceInviteRepository.existsByEmailAndWorkspaceIdAndAccepted(normalizedEmail, workspace.getId(),
                false)) {
            return; // Already invited
        }

        WorkspaceInvite invite = Objects.requireNonNull(WorkspaceInvite.builder()
                .email(normalizedEmail)
                .workspaceId(workspace.getId())
                .accepted(false)
                .build());

        workspaceInviteRepository.save(invite);
    }

    public WorkspaceResponse getWorkspaceById(String idOrSlug) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(idOrSlug))
                .orElseGet(() -> workspaceRepository.findBySlug(idOrSlug)
                        .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + idOrSlug)));

        if (!workspace.getMembers().stream().anyMatch(m -> m.getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("Access denied: You are not a member of this workspace");
        }

        return mapToResponse(workspace);
    }

    public List<UserResponse> getWorkspaceMembers(String idOrSlug) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(idOrSlug))
                .orElseGet(() -> workspaceRepository.findBySlug(idOrSlug)
                        .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + idOrSlug)));

        if (!workspace.getMembers().stream().anyMatch(m -> m.getId().equals(currentUser.getId()))) {
            throw new UnauthorizedException("Access denied: You are not a member of this workspace");
        }

        return workspace.getMembers().stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceResponse addCoAdmin(String workspaceId, String userId) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(workspaceId))
                .orElseGet(() -> workspaceRepository.findBySlug(workspaceId)
                        .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId)));

        if (!workspace.isAdminOrCoAdmin(currentUser.getId())) {
            throw new UnauthorizedException("Only workspace admins can add co-admins");
        }

        workspace.getCoAdminIds().add(userId);
        Workspace saved = Objects.requireNonNull(workspaceRepository.save(workspace));
        return mapToResponse(saved);
    }

    @Transactional
    public WorkspaceResponse removeCoAdmin(String workspaceId, String userId) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(workspaceId))
                .orElseGet(() -> workspaceRepository.findBySlug(workspaceId)
                        .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId)));

        if (!workspace.isAdminOrCoAdmin(currentUser.getId())) {
            throw new UnauthorizedException("Only workspace admins can remove co-admins");
        }

        workspace.getCoAdminIds().remove(userId);
        Workspace saved = Objects.requireNonNull(workspaceRepository.save(workspace));
        return mapToResponse(saved);
    }

    public boolean isSlugAvailable(String slug) {
        return !workspaceRepository.existsBySlug(slug);
    }

    public List<WorkspaceInviteResponse> getPendingInvitations() {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        return workspaceInviteRepository.findByEmailAndAccepted(currentUser.getEmail(), false).stream()
                .map(invite -> {
                    Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(invite.getWorkspaceId()))
                            .orElse(null);
                    if (workspace == null)
                        return null;
                    return WorkspaceInviteResponse.builder()
                            .inviteId(invite.getId())
                            .workspaceId(workspace.getId())
                            .workspaceName(workspace.getName())
                            .workspaceSlug(workspace.getSlug())
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceResponse acceptInvitation(String inviteId) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        User user = userRepository.findById(Objects.requireNonNull(currentUser.getId())).orElseThrow();

        WorkspaceInvite invite = workspaceInviteRepository.findById(Objects.requireNonNull(inviteId))
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invite.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new UnauthorizedException("This invitation is not for you");
        }

        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(invite.getWorkspaceId()))
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        return joinWorkspaceAndAcceptInvite(user, workspace, invite);
    }

    @Transactional
    public WorkspaceResponse acceptInvitationByWorkspaceSlug(String slug) {
        User currentUser = Objects
                .requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        User user = userRepository.findById(Objects.requireNonNull(currentUser.getId())).orElseThrow();

        Workspace workspace = workspaceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with slug: " + slug));

        WorkspaceInvite invite = workspaceInviteRepository.findByEmailAndWorkspaceIdAndAccepted(user.getEmail().toLowerCase(), workspace.getId(), false)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No pending invitation found for your email: " + user.getEmail()));

        if (!invite.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new UnauthorizedException("This invitation is not for you");
        }


        return joinWorkspaceAndAcceptInvite(user, workspace, invite);
    }

    private WorkspaceResponse joinWorkspaceAndAcceptInvite(User user, Workspace workspace, WorkspaceInvite invite) {
        if (workspace.getMembers().contains(user)) {
            invite.setAccepted(true);
            workspaceInviteRepository.save(invite);
            return mapToResponse(workspace);
        }

        workspace.getMembers().add(user);
        user.getWorkspaces().add(workspace);
        invite.setAccepted(true);

        workspaceRepository.save(workspace);
        userRepository.save(user);
        workspaceInviteRepository.save(invite);

        // Notify all workspace members about new user
        UserResponse userResponse = mapUserToResponse(user);
        workspace.getMembers().forEach(member -> {
            messagingTemplate.convertAndSendToUser(
                Objects.requireNonNull(member.getEmail()), 
                "/queue/notifications", 
                Objects.requireNonNull(ChatEvent.builder()
                    .type(ChatEvent.EventType.MEMBER_JOINED)
                    .conversationId(workspace.getId())
                    .senderId(user.getId())
                    .senderName(user.getFullName())
                    .content(userResponse)
                    .build())


            );
        });

        return mapToResponse(workspace);
    }



    private UserResponse mapUserToResponse(User user) {
        return Objects.requireNonNull(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .imageUrl(user.getImageUrl())
                .title(user.getTitle())
                .mobile(user.getMobile())
                .joinedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build());
    }

    private WorkspaceResponse mapToResponse(Workspace workspace) {
        return Objects.requireNonNull(WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .slug(workspace.getSlug())
                .joinCode(workspace.getJoinCode())
                .adminId(workspace.getAdminId())
                .memberIds(workspace.getMembers().stream().map(User::getId).collect(Collectors.toSet()))
                .coAdminIds(workspace.getCoAdminIds())
                .build());
    }
}
