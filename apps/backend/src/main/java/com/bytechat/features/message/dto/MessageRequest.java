package com.bytechat.features.message.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private String content;
    private String channelId;
    private String receiverId;
    private String workspaceId;
    /** ID of the message being replied to. Null if not a reply. */
    private String replyToId;

}
