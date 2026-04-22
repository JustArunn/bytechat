package com.bytechat.features.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DirectConversationResult {
    private ConversationResponse conversation;
    private boolean isNew;
}
