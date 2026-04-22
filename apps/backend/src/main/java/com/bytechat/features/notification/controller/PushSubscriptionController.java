package com.bytechat.features.notification.controller;

import com.bytechat.features.notification.dto.PushSubscriptionRequest;
import com.bytechat.features.notification.model.PushSubscription;
import com.bytechat.features.notification.repository.PushSubscriptionRepository;
import com.bytechat.features.user.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/push")
public class PushSubscriptionController {

    private final PushSubscriptionRepository repository;

    public PushSubscriptionController(PushSubscriptionRepository repository) {
        this.repository = repository;
    }

    @SuppressWarnings("null")
    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@RequestBody PushSubscriptionRequest request, @AuthenticationPrincipal User currentUser) {
        repository.findByEndpoint(request.getEndpoint()).ifPresentOrElse(
            sub -> {
                sub.setP256dh(request.getP256dh());
                sub.setAuth(request.getAuth());
                repository.save(sub);
            },
            () -> {
                PushSubscription sub = PushSubscription.builder()
                        .user(currentUser)
                        .endpoint(request.getEndpoint())
                        .p256dh(request.getP256dh())
                        .auth(request.getAuth())
                        .build();
                repository.save(sub);
            }
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(@RequestBody String endpoint) {
        repository.findByEndpoint(endpoint).ifPresent(repository::delete);
        return ResponseEntity.ok().build();
    }
}
