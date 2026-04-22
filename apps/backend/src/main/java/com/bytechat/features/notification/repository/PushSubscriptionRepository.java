package com.bytechat.features.notification.repository;

import com.bytechat.features.notification.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUserId(String userId);
    Optional<PushSubscription> findByEndpoint(String endpoint);
}
