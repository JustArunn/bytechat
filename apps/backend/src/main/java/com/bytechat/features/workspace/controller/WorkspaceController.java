package com.bytechat.features.workspace.controller;

import com.bytechat.features.workspace.dto.WorkspaceRequest;
import com.bytechat.features.workspace.dto.WorkspaceResponse;
import com.bytechat.features.workspace.dto.WorkspaceInviteResponse;
import com.bytechat.features.user.dto.UserResponse;
import com.bytechat.features.workspace.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(@RequestBody WorkspaceRequest request) {
        return ResponseEntity.ok(workspaceService.createWorkspace(request));
    }

    @GetMapping("/check-slug")
    public ResponseEntity<Boolean> checkSlugAvailability(@RequestParam String slug) {
        return ResponseEntity.ok(workspaceService.isSlugAvailable(slug));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces() {
        return ResponseEntity.ok(workspaceService.getUserWorkspaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(@PathVariable String id) {
        return ResponseEntity.ok(workspaceService.getWorkspaceById(id));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<WorkspaceResponse> getPublicWorkspace(@PathVariable String id) {
        return ResponseEntity.ok(workspaceService.getPublicWorkspaceById(id));
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<Void> inviteUser(@PathVariable String id, @RequestParam String email) {
        workspaceService.inviteUser(id, email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/join/{joinCode}")
    public ResponseEntity<WorkspaceResponse> joinWorkspace(@PathVariable String joinCode) {
        return ResponseEntity.ok(workspaceService.joinWorkspace(joinCode));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserResponse>> getWorkspaceMembers(@PathVariable String id) {
        return ResponseEntity.ok(workspaceService.getWorkspaceMembers(id));
    }

    @PostMapping("/{id}/co-admins/{userId}")
    public ResponseEntity<WorkspaceResponse> addCoAdmin(@PathVariable String id, @PathVariable String userId) {
        return ResponseEntity.ok(workspaceService.addCoAdmin(id, userId));
    }

    @DeleteMapping("/{id}/co-admins/{userId}")
    public ResponseEntity<WorkspaceResponse> removeCoAdmin(@PathVariable String id, @PathVariable String userId) {
        return ResponseEntity.ok(workspaceService.removeCoAdmin(id, userId));
    }

    @GetMapping("/invites")
    public ResponseEntity<List<WorkspaceInviteResponse>> getPendingInvitations() {
        return ResponseEntity.ok(workspaceService.getPendingInvitations());
    }

    @PostMapping("/invites/{inviteId}/accept")
    public ResponseEntity<WorkspaceResponse> acceptInvitation(@PathVariable String inviteId) {
        return ResponseEntity.ok(workspaceService.acceptInvitation(inviteId));
    }

    @PostMapping("/invites/accept-by-slug")
    public ResponseEntity<WorkspaceResponse> joinWorkspaceBySlug(@RequestParam String slug) {
        return ResponseEntity.ok(workspaceService.acceptInvitationByWorkspaceSlug(slug));
    }
}

