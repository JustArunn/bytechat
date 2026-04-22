package com.bytechat.features.user.controller;

import com.bytechat.features.user.dto.UserResponse;
import com.bytechat.features.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody com.bytechat.features.user.dto.UserRequest request) {
        return ResponseEntity.ok(userService.createUser(request.getEmail(), request.getPassword(), request.getFullName(), request.getTitle(), request.getWorkspaceId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String id, @RequestBody com.bytechat.features.user.dto.UserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request.getFullName(), request.getTitle(), request.getMobile(), request.getImageUrl()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
