package com.bytechat.features.conversation.repository;

import com.bytechat.features.conversation.model.ConversationUnreadCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationUnreadCountRepository extends JpaRepository<ConversationUnreadCount, String> {
    Optional<ConversationUnreadCount> findByUserIdAndConversationId(String userId, String conversationId);

    @Modifying
    @Query("UPDATE ConversationUnreadCount c SET c.count = c.count + 1 WHERE c.conversation.id = :conversationId AND c.user.id != :senderId")
    void incrementCountForMembers(String conversationId, String senderId);

    @Modifying
    @Query("UPDATE ConversationUnreadCount c SET c.count = 0 WHERE c.conversation.id = :conversationId AND c.user.id = :userId")
    void resetCount(String conversationId, String userId);
}
