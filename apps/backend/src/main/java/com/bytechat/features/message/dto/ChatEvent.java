package com.bytechat.features.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatEvent {
    private EventType type;
    private String conversationId;
    private String workspaceSlug;
    private String senderId;
    private String senderName;
    private Object content;

    public enum EventType {
        MESSAGE,
        MESSAGE_UPDATE,
        MESSAGE_DELETE,
        REACTION,
        TYPING,
        STOP_TYPING,
        JOIN,
        LEAVE,
        NOTIFICATION,
        MEMBER_JOINED,
        CHANNEL_CREATED,
        CONVERSATION_CREATED,
        NEW_MESSAGE
    }


}
