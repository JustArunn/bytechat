package com.bytechat.features.message.service;

import com.bytechat.features.conversation.dto.DirectConversationResult;
import com.bytechat.features.conversation.service.ConversationService;

import com.bytechat.features.message.dto.ChatEvent;
import com.bytechat.features.message.dto.MessageRequest;
import com.bytechat.features.message.dto.MessageResponse;
import com.bytechat.exception.ResourceNotFoundException;
import com.bytechat.exception.UnauthorizedException;
import com.bytechat.features.conversation.model.Conversation;
import com.bytechat.features.message.model.Message;
import com.bytechat.features.message.model.MessageReaction;
import com.bytechat.features.user.model.User;
import com.bytechat.features.message.repository.AttachmentRepository;
import com.bytechat.features.conversation.repository.ConversationRepository;
import com.bytechat.features.message.repository.MessageRepository;
import com.bytechat.features.message.repository.MessageReactionRepository;
import com.bytechat.features.notification.service.NotificationService;
import com.bytechat.features.notification.service.PushNotificationService;
import com.bytechat.features.conversation.repository.ConversationUnreadCountRepository;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MessageReactionRepository messageReactionRepository;

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private PushNotificationService pushNotificationService;

    @Autowired
    private ConversationUnreadCountRepository unreadCountRepository;



    @org.springframework.transaction.annotation.Transactional
    public MessageResponse sendMessage(MessageRequest request) {
        User currentUser = Objects.requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        
        Conversation conversation;
        if (request.getChannelId() != null && !request.getChannelId().isBlank()) {
            conversation = conversationRepository.findById(Objects.requireNonNull(request.getChannelId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        } else if (request.getReceiverId() != null && !request.getReceiverId().isBlank()) {
            // Find or create direct conversation
            DirectConversationResult result = 
                conversationService.getOrCreateDirectConversation(request.getWorkspaceId(), request.getReceiverId());
            conversation = conversationRepository.findById(Objects.requireNonNull(result.getConversation().getId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation creation failed"));
            
            // IF NEW -> Notify both members about the new conversation structure
            if (result.isNew()) {
                conversation.getMembers().forEach(member -> {
                    messagingTemplate.convertAndSendToUser(
                        Objects.requireNonNull(member.getEmail()), 
                        "/queue/notifications", 
                        Objects.requireNonNull(ChatEvent.builder()
                            .type(ChatEvent.EventType.CONVERSATION_CREATED)
                            .conversationId(conversation.getId())
                            .senderId(currentUser.getId())
                            .senderName(currentUser.getFullName())
                            .content(result.getConversation())
                            .build())
                    );
                });
            }
        } else {

            throw new IllegalArgumentException("Either channelId or receiverId must be provided");
        }

        if (!conversation.getMembers().contains(currentUser) && conversation.getType() != Conversation.ConversationType.PUBLIC) {
            throw new UnauthorizedException("Access denied: You are not a member of this conversation");
        }


        // Resolve replyTo if provided
        Message replyTo = null;
        if (request.getReplyToId() != null && !request.getReplyToId().isBlank()) {
            replyTo = messageRepository.findById(Objects.requireNonNull(request.getReplyToId())).orElse(null);
        }

        Message message = Objects.requireNonNull(Message.builder()
                .content(request.getContent())
                .sender(currentUser)
                .conversation(conversation)
                .replyTo(replyTo)
                .build());

        Message savedMessage = Objects.requireNonNull(messageRepository.save(message));
        MessageResponse response = mapToResponse(savedMessage);
        
        messagingTemplate.convertAndSend("/topic/chat/" + conversation.getId(), 
            Objects.requireNonNull(com.bytechat.features.message.dto.ChatEvent.builder()
                .type(com.bytechat.features.message.dto.ChatEvent.EventType.MESSAGE)
                .conversationId(conversation.getId())
                .senderId(currentUser.getId())
                .content(response)
                .build()));


        // Increment unread counts for other members
        unreadCountRepository.incrementCountForMembers(conversation.getId(), currentUser.getId());




        // 1. Notify members via WebSocket (Existing Logic)
        conversation.getMembers().forEach(member -> {
            if (!member.getId().equals(currentUser.getId())) {
                // Send NEW_MESSAGE event for Browser Notifications

                messagingTemplate.convertAndSendToUser(
                    Objects.requireNonNull(member.getEmail()),
                    "/queue/notifications",
                    Objects.requireNonNull(com.bytechat.features.message.dto.ChatEvent.builder()
                        .type(com.bytechat.features.message.dto.ChatEvent.EventType.NEW_MESSAGE)
                        .conversationId(conversation.getId())
                        .senderId(currentUser.getId())
                        .senderName(currentUser.getFullName())
                        .workspaceSlug(conversation.getWorkspace().getSlug())
                        .content(java.util.Map.of(
                            "message", message.getContent(),
                            "workspaceSlug", conversation.getWorkspace().getSlug(),
                            "conversationType", conversation.getType() == Conversation.ConversationType.DIRECT ? "DM" : "CHANNEL"
                        ))
                        .build())
                );
                
                // Save DB notification for direct messages
                if (conversation.getType() == Conversation.ConversationType.DIRECT) {
                    notificationService.createNotification(
                        member.getId(),
                        currentUser.getFullName(),
                        com.bytechat.features.notification.model.Notification.NotificationType.MESSAGE,
                        currentUser.getFullName(),
                        message.getContent(),
                        "/" + conversation.getWorkspace().getId() + "/" + conversation.getId() + "?messageId=" + savedMessage.getId()
                    );
                }
            }
        });

        // 2. Batch System Push Notifications (New Centralized Logic)
        pushNotificationService.sendPushToUsers(
            conversation.getMembers().stream().map(User::getId).collect(Collectors.toList()),
            currentUser.getId(),
            "New Message from " + currentUser.getFullName(),
            message.getContent(),
            "/" + conversation.getWorkspace().getSlug() + "/" + conversation.getId()
        );


                
        return response;
    }

    @org.springframework.transaction.annotation.Transactional
    public MessageResponse sendMessageWithAttachments(String content, String conversationId, org.springframework.web.multipart.MultipartFile[] files) {
        User currentUser = Objects.requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(conversationId))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getMembers().contains(currentUser) && conversation.getType() != Conversation.ConversationType.PUBLIC) {
            throw new UnauthorizedException("Access denied");
        }

        Message message = Objects.requireNonNull(Message.builder()
                .content(content)
                .sender(currentUser)
                .conversation(conversation)
                .build());

        Message savedMessage = Objects.requireNonNull(messageRepository.save(message));

        if (files != null) {
            for (org.springframework.web.multipart.MultipartFile file : files) {
                String fileName = fileService.storeFile(file);
                com.bytechat.features.message.model.Attachment attachment = Objects.requireNonNull(com.bytechat.features.message.model.Attachment.builder()
                        .fileName(file.getOriginalFilename())
                        .fileType(file.getContentType())
                        .fileUrl("/uploads/" + fileName)
                        .message(savedMessage)
                        .build());
                attachmentRepository.save(attachment);
                savedMessage.getAttachments().add(attachment);
            }
        }

        MessageResponse response = mapToResponse(savedMessage);
        
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, 
            Objects.requireNonNull(com.bytechat.features.message.dto.ChatEvent.builder()
                .type(com.bytechat.features.message.dto.ChatEvent.EventType.MESSAGE)
                .conversationId(conversationId)
                .senderId(currentUser.getId())
                .content(response)
                .build()));

        // Increment unread counts for other members
        unreadCountRepository.incrementCountForMembers(conversationId, currentUser.getId());

        // Notify other members
        conversation.getMembers().forEach(member -> {
            if (!member.getId().equals(currentUser.getId())) {
                // Send NEW_MESSAGE event for Browser Notifications
                messagingTemplate.convertAndSendToUser(
                    Objects.requireNonNull(member.getEmail()),
                    "/queue/notifications",
                    Objects.requireNonNull(com.bytechat.features.message.dto.ChatEvent.builder()
                        .type(com.bytechat.features.message.dto.ChatEvent.EventType.NEW_MESSAGE)
                        .conversationId(conversationId)
                        .senderId(currentUser.getId())
                        .senderName(currentUser.getFullName())
                        .workspaceSlug(conversation.getWorkspace().getSlug())
                        .content(java.util.Map.of(
                            "message", message.getContent(),
                            "workspaceSlug", conversation.getWorkspace().getSlug(),
                            "conversationType", conversation.getType() == Conversation.ConversationType.DIRECT ? "DM" : "CHANNEL"
                        ))
                        .build())
                );

            }
        });

        return response;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<MessageResponse> getConversationMessages(String conversationId, int page, int size) {
        User currentUser = Objects.requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(conversationId))
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getMembers().contains(currentUser)) {
            throw new UnauthorizedException("Access denied: You are not a member of this conversation");
        }


        Page<Message> messagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                Objects.requireNonNull(conversationId), PageRequest.of(page, size));
        
        return messagePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    public MessageResponse updateMessage(String id, String content) {
        User currentUser = Objects.requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Message message = messageRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only edit your own messages");
        }

        message.setContent(content);
        message.setUpdatedAt(LocalDateTime.now());
        Message savedMessage = Objects.requireNonNull(messageRepository.save(message));
        MessageResponse response = mapToResponse(savedMessage);

        messagingTemplate.convertAndSend("/topic/chat/" + message.getConversation().getId(), 
            Objects.requireNonNull(com.bytechat.features.message.dto.ChatEvent.builder()
                .type(com.bytechat.features.message.dto.ChatEvent.EventType.MESSAGE_UPDATE)
                .conversationId(message.getConversation().getId())
                .senderId(currentUser.getId())
                .senderName(currentUser.getFullName())
                .content(response)
                .build()));

        return response;
    }

    public void deleteMessage(String id) {
        User currentUser = Objects.requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Message message = messageRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        boolean isSender = message.getSender().getId().equals(currentUser.getId());
        boolean isWorkspaceAdmin = message.getConversation().getWorkspace().isAdminOrCoAdmin(currentUser.getId());

        if (!isSender && !isWorkspaceAdmin) {
            throw new UnauthorizedException("Access denied: You can only delete your own messages or be a workspace admin");
        }

        String conversationId = message.getConversation().getId();
        messageRepository.delete(message);

        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, 
            Objects.requireNonNull(com.bytechat.features.message.dto.ChatEvent.builder()
                .type(com.bytechat.features.message.dto.ChatEvent.EventType.MESSAGE_DELETE)
                .conversationId(conversationId)
                .senderId(currentUser.getId())
                .senderName(currentUser.getFullName())
                .content(id)
                .build()));
    }

    /**
     * Toggle an emoji reaction on a message.
     * Adds the reaction if the user hasn't reacted with this emoji yet; removes it otherwise.
     * Broadcasts the updated message to the conversation topic.
     */
    @org.springframework.transaction.annotation.Transactional
    public MessageResponse toggleReaction(String messageId, String emoji) {
        User currentUser = Objects.requireNonNull((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        Message message = messageRepository.findById(Objects.requireNonNull(messageId))
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        var existing = messageReactionRepository
                .findByMessageIdAndUserIdAndEmoji(messageId, currentUser.getId(), emoji);

        if (existing.isPresent()) {
            messageReactionRepository.delete(Objects.requireNonNull(existing.get()));
            message.getReactions().removeIf(r -> r.getId() != null && r.getId().equals(Objects.requireNonNull(existing.get()).getId()));
        } else {
            MessageReaction reaction = Objects.requireNonNull(MessageReaction.builder()
                    .message(message)
                    .user(currentUser)
                    .emoji(emoji)
                    .build());
            messageReactionRepository.save(reaction);
            message.getReactions().add(reaction);
        }

        MessageResponse response = mapToResponse(message);

        messagingTemplate.convertAndSend("/topic/chat/" + message.getConversation().getId(),
            Objects.requireNonNull(com.bytechat.features.message.dto.ChatEvent.builder()
                .type(com.bytechat.features.message.dto.ChatEvent.EventType.REACTION)
                .conversationId(message.getConversation().getId())
                .senderId(currentUser.getId())
                .senderName(currentUser.getFullName())
                .content(response)
                .build()));

        if (!message.getSender().getId().equals(currentUser.getId())) {
            String preview = message.getContent().length() > 30 ? message.getContent().substring(0, 30) + "..." : message.getContent();
            
            // 1. Save DB Notification
            notificationService.createNotification(
                message.getSender().getId(),
                currentUser.getFullName(),
                com.bytechat.features.notification.model.Notification.NotificationType.REACTION,
                "New Reaction",
                currentUser.getFullName() + " reacted to: \"" + preview + "\"",
                "/" + message.getConversation().getWorkspace().getId() + "/" + message.getConversation().getId() + "?messageId=" + message.getId()
            );

            // 2. Send System Push Notification (to message sender only)
            pushNotificationService.sendPush(
                message.getSender().getId(),
                "New Reaction",
                currentUser.getFullName() + " reacted to your message with " + emoji,
                "/" + message.getConversation().getWorkspace().getSlug() + "/" + message.getConversation().getId()
            );
        }


        return response;
    }

    private MessageResponse mapToResponse(Message message) {
        // Build replyTo info
        MessageResponse.ReplyToInfo replyToInfo = null;
        if (message.getReplyTo() != null) {
            Message rt = message.getReplyTo();
            replyToInfo = MessageResponse.ReplyToInfo.builder()
                    .id(rt.getId())
                    .senderName(rt.getSender().getFullName())
                    .content(rt.getContent())
                    .build();
        }

        // Group reactions by emoji
        Map<String, List<MessageReaction>> grouped = message.getReactions().stream()
                .collect(Collectors.groupingBy(MessageReaction::getEmoji));

        List<MessageResponse.ReactionGroup> reactionGroups = grouped.entrySet().stream()
                .map(e -> MessageResponse.ReactionGroup.builder()
                        .emoji(e.getKey())
                        .count(e.getValue().size())
                        .userIds(e.getValue().stream().map(r -> r.getUser().getId()).collect(Collectors.toList()))
                        .userNames(e.getValue().stream().map(r -> r.getUser().getFullName()).collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return Objects.requireNonNull(MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .senderImageUrl(message.getSender().getImageUrl())
                .channelId(message.getConversation().getId())
                .workspaceSlug(message.getConversation().getWorkspace().getSlug())
                .attachmentUrls(message.getAttachments().stream().map(com.bytechat.features.message.model.Attachment::getFileUrl).collect(Collectors.toList()))

                .timestamp(message.getCreatedAt() != null ? message.getCreatedAt() : LocalDateTime.now())
                .replyTo(replyToInfo)
                .reactions(reactionGroups)
                .build());
    }
}
