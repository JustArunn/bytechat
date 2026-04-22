package com.bytechat.features.message.repository;

import com.bytechat.features.message.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, String> {

    List<MessageReaction> findByMessageId(String messageId);

    Optional<MessageReaction> findByMessageIdAndUserIdAndEmoji(String messageId, String userId, String emoji);

    void deleteByMessageIdAndUserIdAndEmoji(String messageId, String userId, String emoji);
}
