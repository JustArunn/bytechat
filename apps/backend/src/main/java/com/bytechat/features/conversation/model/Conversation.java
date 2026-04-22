package com.bytechat.features.conversation.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import com.bytechat.features.user.model.User;
import com.bytechat.features.workspace.model.Workspace;
import com.bytechat.features.conversation.model.Conversation;
import com.bytechat.features.message.model.Message;
import com.bytechat.shared.model.BaseEntity;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"workspace", "messages", "members"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Conversation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    private String creatorId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "conversation_members",
            joinColumns = @JoinColumn(name = "conversation_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Message> messages = new HashSet<>();

    public enum ConversationType {
        PUBLIC, PRIVATE, DIRECT
    }
}
