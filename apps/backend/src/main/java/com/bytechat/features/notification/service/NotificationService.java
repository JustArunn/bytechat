package com.bytechat.features.notification.service;

import com.bytechat.features.notification.dto.NotificationResponse;
import com.bytechat.exception.ResourceNotFoundException;
import com.bytechat.features.notification.model.Notification;
import com.bytechat.features.user.model.User;
import com.bytechat.features.notification.repository.NotificationRepository;
import com.bytechat.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(String userId, String actorName, Notification.NotificationType type, 
                                   String title, String message, String link) {
        User user = userRepository.findById(Objects.requireNonNull(userId)).orElse(null);
        if (user == null) return;

        Notification notification = Objects.requireNonNull(Notification.builder()
                .user(user)
                .actorName(actorName)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .isRead(false)
                .build());
        
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getCurrentUserNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return List.of();
        }
        User currentUser = (User) authentication.getPrincipal();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .filter(n -> !n.isRead())
                .limit(100) // limit to 100 recent unread notifications
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return;
        User currentUser = (User) authentication.getPrincipal();
        
        Notification notification = notificationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (notification.getUser().getId().equals(currentUser.getId())) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return;
        User currentUser = (User) authentication.getPrincipal();
        notificationRepository.markAllAsReadByUserId(currentUser.getId());
    }

    @Transactional
    public void clearAll() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return;
        User currentUser = (User) authentication.getPrincipal();
        notificationRepository.deleteByUserId(currentUser.getId());
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return Objects.requireNonNull(NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .link(notification.getLink())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .actorName(notification.getActorName())
                .build());
    }
}
