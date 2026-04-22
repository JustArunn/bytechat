package com.bytechat.features.conversation.dto;

import com.bytechat.features.conversation.model.Conversation;
import lombok.Builder;
import lombok.Data;
import com.bytechat.features.user.dto.UserResponse;
import java.util.List;

@Data
@Builder
public class ConversationResponse {
    private String id;
    private String name;
    private Conversation.ConversationType type;
    private String workspaceId;
    private String workspaceSlug;
    private UserResponse receiver; // For DIRECT conversations

    private java.time.LocalDateTime createdAt;
    private String creatorId;
    private List<UserResponse> members;
    private int unreadCount;


}
