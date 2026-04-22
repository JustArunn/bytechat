package com.bytechat.features.conversation.service;

import com.bytechat.features.conversation.dto.ConversationRequest;
import com.bytechat.features.conversation.dto.ConversationResponse;
import com.bytechat.features.user.dto.UserResponse;
import com.bytechat.exception.ResourceNotFoundException;
import com.bytechat.exception.UnauthorizedException;
import com.bytechat.features.conversation.dto.DirectConversationResult;
import com.bytechat.features.conversation.model.Conversation;

import com.bytechat.features.user.model.User;
import com.bytechat.features.workspace.model.Workspace;
import com.bytechat.features.conversation.repository.ConversationRepository;
import com.bytechat.features.user.repository.UserRepository;
import com.bytechat.features.workspace.repository.WorkspaceRepository;
import com.bytechat.security.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.bytechat.features.conversation.repository.ConversationUnreadCountRepository;
import com.bytechat.features.message.dto.ChatEvent;
import com.bytechat.features.conversation.model.ConversationUnreadCount;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationUnreadCountRepository unreadCountRepository;


    public ConversationResponse createConversation(ConversationRequest request) {
        User currentUser = getCurrentUser();
        String workspaceId = request.getWorkspaceId() != null ? request.getWorkspaceId() : TenantContext.getCurrentTenant();
        if (workspaceId == null) {
            throw new ResourceNotFoundException("Workspace context not found. Please ensure you are accessing via a valid subdomain.");
        }
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseGet(() -> workspaceRepository.findBySlug(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId)));

        if (!workspace.isAdminOrCoAdmin(currentUser.getId())) {
            throw new UnauthorizedException("Access denied: Only workspace admins can create channels");
        }

        Conversation conversation = Conversation.builder()
                .name(request.getName())
                .type(Conversation.ConversationType.PRIVATE) // Forced to PRIVATE
                .workspace(workspace)
                .build();


        conversation.getMembers().add(currentUser);
        conversation.setCreatorId(currentUser.getId());
        Conversation saved = conversationRepository.save(conversation);

        // Initialize unread count for the creator
        unreadCountRepository.save(ConversationUnreadCount.builder()
                .user(currentUser)
                .conversation(saved)
                .count(0)
                .build());

        ConversationResponse response = mapToResponse(saved, currentUser);


        // Notify all current members (including creator) about the new channel
        // This ensures the sidebar updates in real-time across all tabs/users
        saved.getMembers().forEach(member -> {
            messagingTemplate.convertAndSendToUser(
                Objects.requireNonNull(member.getEmail()), 
                "/queue/notifications", 
                Objects.requireNonNull(ChatEvent.builder()
                    .type(ChatEvent.EventType.CHANNEL_CREATED)
                    .conversationId(saved.getId())
                    .content(response)
                    .build())

            );
        });

        return response;

    }



    public DirectConversationResult getOrCreateDirectConversation(String workspaceId, String otherUserId) {

        User currentUser = getCurrentUser();
        User otherUser = userRepository.findById(Objects.requireNonNull(otherUserId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String resolvedWorkspaceId = workspaceId != null ? workspaceId : TenantContext.getCurrentTenant();
        if (resolvedWorkspaceId == null) {
            throw new ResourceNotFoundException("Workspace context not found");
        }
        Workspace workspace = workspaceRepository.findById(resolvedWorkspaceId)
                .orElseGet(() -> workspaceRepository.findBySlug(resolvedWorkspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + resolvedWorkspaceId)));

        if (!workspace.getMembers().contains(currentUser) || !workspace.getMembers().contains(otherUser)) {
            throw new UnauthorizedException("Access denied: Both users must be members of the workspace");
        }

        // Look for existing DM
        List<Conversation> conversations = conversationRepository.findByWorkspaceId(workspace.getId());
        for (Conversation c : conversations) {
            boolean hasCurrent = c.getMembers().stream().anyMatch(m -> m.getId().equals(currentUser.getId()));
            boolean hasOther = c.getMembers().stream().anyMatch(m -> m.getId().equals(otherUser.getId()));
            
            if (c.getType() == Conversation.ConversationType.DIRECT && hasCurrent && hasOther) {
                
                return new DirectConversationResult(mapToResponse(c, currentUser), false);


            }
        }

        // Create new DM
        Conversation dm = Conversation.builder()
                .name("dm_" + currentUser.getId().substring(0, 4) + "_" + otherUser.getId().substring(0, 4))
                .type(Conversation.ConversationType.DIRECT)
                .workspace(workspace)
                .build();
        
        dm.getMembers().add(currentUser);
        dm.getMembers().add(otherUser);
        
        Conversation saved = conversationRepository.save(dm);

        // Initialize unread count for both members
        unreadCountRepository.save(ConversationUnreadCount.builder()
                .user(currentUser)
                .conversation(saved)
                .count(0)
                .build());
        unreadCountRepository.save(ConversationUnreadCount.builder()
                .user(otherUser)
                .conversation(saved)
                .count(0)
                .build());

        ConversationResponse response = mapToResponse(saved, currentUser);


        return new DirectConversationResult(response, true);

    }




    public void addMemberToConversation(String conversationId, String userId) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(conversationId))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        boolean isWorkspaceAdmin = conversation.getWorkspace().isAdminOrCoAdmin(currentUser.getId());
        boolean isChannelMember = conversation.getMembers().contains(currentUser);

        if (!isWorkspaceAdmin && !isChannelMember) {
            throw new UnauthorizedException("Access denied: You must be a channel member or workspace admin to add others");
        }

        User userToAdd = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        conversation.getMembers().add(userToAdd);
        Conversation saved = conversationRepository.save(conversation);

        // Initialize unread count for the new member
        if (unreadCountRepository.findByUserIdAndConversationId(userToAdd.getId(), saved.getId()).isEmpty()) {
            unreadCountRepository.save(ConversationUnreadCount.builder()
                    .user(userToAdd)
                    .conversation(saved)
                    .count(0)
                    .build());
        }

        // Notify the added user so it appears in their sidebar immediately
        messagingTemplate.convertAndSendToUser(
            Objects.requireNonNull(userToAdd.getEmail()), 
            "/queue/notifications", 
            Objects.requireNonNull(ChatEvent.builder()
                .type(ChatEvent.EventType.CHANNEL_CREATED)
                .conversationId(saved.getId())
                .content(mapToResponse(saved, userToAdd))
                .build())

        );
    }


    public void removeMemberFromConversation(String conversationId, String userId) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(conversationId))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        boolean isWorkspaceAdmin = conversation.getWorkspace().isAdminOrCoAdmin(currentUser.getId());
        boolean isCreator = currentUser.getId().equals(conversation.getCreatorId());

        if (!isWorkspaceAdmin && !isCreator) {
            throw new UnauthorizedException("Access denied: Only workspace admins or the channel creator can remove members");
        }

        User userToRemove = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (userToRemove.getId().equals(conversation.getCreatorId())) {
            throw new UnauthorizedException("Access denied: You cannot remove the channel owner");
        }

        conversation.getMembers().remove(userToRemove);
        conversationRepository.save(conversation);
    }

    public List<ConversationResponse> getConversationsByWorkspace(String idOrSlug) {
        User currentUser = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(Objects.requireNonNull(idOrSlug))
                .orElseGet(() -> workspaceRepository.findBySlug(idOrSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + idOrSlug)));

        if (!workspace.getMembers().contains(currentUser)) {
            throw new UnauthorizedException("Access denied");
        }

        return conversationRepository.findByWorkspaceId(workspace.getId()).stream()
                .filter(c -> {
                    // Only members can see the channel
                    return c.getMembers().stream().anyMatch(m -> m.getId().equals(currentUser.getId()));
                })

                .map(c -> {
                    return mapToResponse(c, currentUser);
                })
                .collect(Collectors.toList());
    }

    public ConversationResponse getConversationById(String id) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        boolean isMember = conversation.getMembers().stream().anyMatch(m -> m.getId().equals(currentUser.getId()));
        if (!isMember) {
            throw new UnauthorizedException("Access denied: You are not a member of this channel");
        }


        return mapToResponse(conversation, currentUser);
    }

    public ConversationResponse updateConversation(String id, ConversationRequest request) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        boolean isWorkspaceAdmin = conversation.getWorkspace().isAdminOrCoAdmin(currentUser.getId());
        boolean isCreator = currentUser.getId().equals(conversation.getCreatorId());

        if (!isWorkspaceAdmin && !isCreator) {
            throw new UnauthorizedException("Access denied: Only workspace admins or the channel creator can update this channel");
        }

        conversation.setName(request.getName());
        conversation.setType(request.getType());
        
        Conversation saved = conversationRepository.save(conversation);
        return mapToResponse(saved, currentUser);
    }

    public void deleteConversation(String id) {
        User currentUser = getCurrentUser();
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        boolean isWorkspaceAdmin = conversation.getWorkspace().isAdminOrCoAdmin(currentUser.getId());
        boolean isCreator = currentUser.getId().equals(conversation.getCreatorId());

        if (!isWorkspaceAdmin && !isCreator) {
            throw new UnauthorizedException("Access denied: Only workspace admins or the channel creator can delete this channel");
        }

        conversationRepository.delete(conversation);
    }

    public void resetUnreadCount(String conversationId) {
        User currentUser = getCurrentUser();
        unreadCountRepository.resetCount(conversationId, currentUser.getId());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ConversationResponse mapToResponse(Conversation conversation, User currentUser) {
        UserResponse receiver = null;
        if (conversation.getType() == Conversation.ConversationType.DIRECT) {
            User otherUser = conversation.getMembers().stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .findFirst()
                    .orElse(currentUser);
            
            receiver = UserResponse.builder()
                    .id(otherUser.getId())
                    .email(otherUser.getEmail())
                    .fullName(otherUser.getFullName())
                    .imageUrl(otherUser.getImageUrl())
                    .build();
        }

        return ConversationResponse.builder()
                .id(conversation.getId())
                .name(conversation.getName())
                .type(conversation.getType())
                .workspaceId(conversation.getWorkspace().getId())
                .workspaceSlug(conversation.getWorkspace().getSlug())
                .receiver(receiver)

                .createdAt(conversation.getCreatedAt())
                .creatorId(conversation.getCreatorId())
                .members(conversation.getMembers().stream()
                        .map(u -> UserResponse.builder()
                                .id(u.getId())
                                .email(u.getEmail())
                                .fullName(u.getFullName())
                                .imageUrl(u.getImageUrl())
                                .build())
                        .collect(Collectors.toList()))
                .unreadCount(unreadCountRepository.findByUserIdAndConversationId(currentUser.getId(), conversation.getId())
                        .map(ConversationUnreadCount::getCount)
                        .orElse(0))
                .build();
    }
}
