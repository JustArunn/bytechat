package com.bytechat.features.conversation.dto;

import com.bytechat.features.conversation.model.Conversation;
import lombok.Data;

@Data
public class ConversationRequest {
    private String name;
    private Conversation.ConversationType type;
    private String workspaceId;
}
