package com.bytechat.features.message.repository;

import com.bytechat.features.message.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    Page<Message> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Message m JOIN m.conversation c WHERE c.workspace.id = :workspaceId AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    java.util.List<Message> searchMessages(String workspaceId, String query);
}
