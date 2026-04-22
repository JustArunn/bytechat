package com.bytechat.features.message.controller;

import com.bytechat.features.message.dto.MessageRequest;
import com.bytechat.features.message.dto.MessageResponse;
import com.bytechat.features.message.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(request));
    }

    @PostMapping("/upload")
    public ResponseEntity<MessageResponse> sendMessageWithAttachments(
            @RequestParam("content") String content,
            @RequestParam("conversationId") String conversationId,
            @RequestParam(value = "files", required = false) org.springframework.web.multipart.MultipartFile[] files) {
        return ResponseEntity.ok(messageService.sendMessageWithAttachments(content, conversationId, files));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponse>> getConversationMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(messageService.getConversationMessages(conversationId, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse> updateMessage(@PathVariable String id, @RequestBody MessageRequest request) {
        return ResponseEntity.ok(messageService.updateMessage(id, request.getContent()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/messages/{id}/react?emoji=👍
     * Toggles the current user's reaction on a message.
     */
    @PostMapping("/{id}/react")
    public ResponseEntity<MessageResponse> toggleReaction(
            @PathVariable String id,
            @RequestParam String emoji) {
        return ResponseEntity.ok(messageService.toggleReaction(id, emoji));
    }
}
