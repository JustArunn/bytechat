package com.bytechat.features.message.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MessageResponse {
    private String id;
    private String content;
    private String senderId;
    private String senderName;
    private String senderImageUrl;
    private String channelId;
    private String workspaceSlug;
    private List<String> attachmentUrls;

    private LocalDateTime timestamp;

    /** Summary of the replied-to message (null if not a reply). */
    private ReplyToInfo replyTo;

    /** Grouped emoji reactions on this message. */
    private List<ReactionGroup> reactions;

    @Data
    @Builder
    public static class ReplyToInfo {
        private String id;
        private String senderName;
        private String content;
    }

    @Data
    @Builder
    public static class ReactionGroup {
        private String emoji;
        private int count;
        private List<String> userIds;
        private List<String> userNames;
    }
}
