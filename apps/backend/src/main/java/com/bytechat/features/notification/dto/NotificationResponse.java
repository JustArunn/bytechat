package com.bytechat.features.notification.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String type;
    private String title;
    private String message;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String actorName;
}
