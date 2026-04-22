package com.bytechat.features.conversation.model;

import jakarta.persistence.*;
import lombok.*;
import com.bytechat.features.user.model.User;

@Entity
@Table(name = "conversation_unread_counts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationUnreadCount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Builder.Default
    private int count = 0;
}
