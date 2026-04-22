package com.bytechat.features.message.controller;

import com.bytechat.features.message.dto.ChatEvent;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    // Handles messages sent to /app/chat/{conversationId}
    @MessageMapping("/chat/{conversationId}")
    @SendTo("/topic/chat/{conversationId}")
    public ChatEvent handleChatMessage(@DestinationVariable String conversationId, @Payload ChatEvent event) {
        return event;
    }

    // Handles typing indicator sent to /app/chat/{conversationId}/typing
    @MessageMapping("/chat/{conversationId}/typing")
    @SendTo("/topic/chat/{conversationId}/typing")
    public ChatEvent handleTyping(@DestinationVariable String conversationId, @Payload ChatEvent event) {
        return event;
    }
}
