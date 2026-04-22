package com.bytechat.features.notification.service;

import com.bytechat.features.notification.config.PushConfig;
import com.bytechat.features.notification.repository.PushSubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;

import java.security.Security;
import java.util.Map;
import java.util.Objects;


@Service
public class PushNotificationService {

    private final PushSubscriptionRepository repository;
    private final ObjectMapper objectMapper;
    private final PushConfig pushConfig;
    private PushService pushService;

    public PushNotificationService(PushSubscriptionRepository repository, ObjectMapper objectMapper, PushConfig pushConfig) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.pushConfig = pushConfig;
    }


    @jakarta.annotation.PostConstruct
    public void init() throws Exception {
        Security.addProvider(new BouncyCastleProvider());
        pushService = new PushService(
            Objects.requireNonNull(pushConfig.getPublicKey()), 
            Objects.requireNonNull(pushConfig.getPrivateKey()), 
            Objects.requireNonNull(pushConfig.getSubject())
        );
    }


    @SuppressWarnings("null")
    public void sendPush(String userId, String title, String message, String url) {
        sendPushToUsers(java.util.List.of(userId), null, title, message, url);
    }

    /**
     * Sends push notifications to a list of user IDs, excluding a specific user ID (usually the sender).
     */
    @SuppressWarnings("null")
    public void sendPushToUsers(java.util.List<String> userIds, String excludeUserId, String title, String message, String url) {
        userIds.stream()
            .filter(userId -> excludeUserId == null || !userId.equals(excludeUserId))
            .forEach(userId -> {
                repository.findByUserId(userId).forEach(sub -> {
                    try {
                        Map<String, String> payload = Map.of(
                                "title", title,
                                "message", message,
                                "url", url
                        );
                        
                        Notification notification = new Notification(
                                sub.getEndpoint(),
                                sub.getP256dh(),
                                sub.getAuth(),
                                objectMapper.writeValueAsBytes(payload)
                        );
                        
                        pushService.send(notification);
                    } catch (Exception e) {
                        // If 410 Gone, remove subscription
                        if (e.getMessage() != null && e.getMessage().contains("410")) {
                            repository.delete(sub);
                        }
                        e.printStackTrace();
                    }
                });
            });
    }
}

