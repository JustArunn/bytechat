package com.bytechat.features.message.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import com.bytechat.features.user.model.User;
import com.bytechat.features.conversation.model.Conversation;
import com.bytechat.shared.model.BaseEntity;

@Entity
@Table(name = "messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "sender", "conversation", "replyTo", "reactions" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Message extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    /** The message this one is replying to (null if not a reply). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Attachment> attachments = new HashSet<>();

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MessageReaction> reactions = new ArrayList<>();

    public LocalDateTime getTimestamp() {
        return getCreatedAt();
    }
}
