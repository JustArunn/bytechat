package com.bytechat.features.conversation.controller;

import com.bytechat.features.conversation.dto.ConversationRequest;
import com.bytechat.features.conversation.dto.ConversationResponse;
import com.bytechat.security.TenantContext;
import com.bytechat.features.conversation.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(@RequestBody ConversationRequest request) {
        return ResponseEntity.ok(conversationService.createConversation(request));
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<ConversationResponse>> getWorkspaceConversations(@PathVariable String workspaceId) {
        return ResponseEntity.ok(conversationService.getConversationsByWorkspace(workspaceId));
    }

    @GetMapping("/current")
    public ResponseEntity<List<ConversationResponse>> getCurrentWorkspaceConversations() {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(conversationService.getConversationsByWorkspace(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationResponse> getConversation(@PathVariable String id) {
        return ResponseEntity.ok(conversationService.getConversationById(id));
    }

    @PostMapping("/direct")
    public ResponseEntity<ConversationResponse> getOrCreateDM(@RequestParam String workspaceId, @RequestParam String userId) {
        return ResponseEntity.ok(conversationService.getOrCreateDirectConversation(workspaceId, userId).getConversation());
    }


    @PostMapping("/{conversationId}/members/{userId}")
    public ResponseEntity<Void> addMember(@PathVariable String conversationId, @PathVariable String userId) {
        conversationService.addMemberToConversation(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{conversationId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable String conversationId, @PathVariable String userId) {
        conversationService.removeMemberFromConversation(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConversationResponse> updateConversation(@PathVariable String id, @RequestBody ConversationRequest request) {
        return ResponseEntity.ok(conversationService.updateConversation(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/reset-unread-count")
    public ResponseEntity<Void> resetUnreadCount(@PathVariable String id) {
        conversationService.resetUnreadCount(id);
        return ResponseEntity.ok().build();
    }



}
