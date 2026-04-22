package com.bytechat.features.notification.controller;

import com.bytechat.features.notification.dto.NotificationResponse;
import com.bytechat.features.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications() {
        return ResponseEntity.ok(notificationService.getCurrentUserNotifications());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAll() {
        notificationService.clearAll();
        return ResponseEntity.ok().build();
    }
}
