package com.bytechat.features.conversation.repository;

import com.bytechat.features.conversation.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findByWorkspaceId(String workspaceId);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Conversation c WHERE c.workspace.id = :workspaceId AND c.type <> 'DIRECT' AND LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Conversation> searchChannels(String workspaceId, String query);
}
