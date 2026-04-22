package com.bytechat.features.search.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SearchResponse {
    private List<UserResult> users;
    private List<ChannelResult> channels;
    private List<MessageResult> messages;

    @Data
    @Builder
    public static class UserResult {
        private String id;
        private String fullName;
        private String email;
        private String imageUrl;
    }

    @Data
    @Builder
    public static class ChannelResult {
        private String id;
        private String name;
        private String type;
    }

    @Data
    @Builder
    public static class MessageResult {
        private String id;
        private String content;
        private String senderName;
        private String conversationId;
        private String conversationName;
        private String timestamp;
    }
}
