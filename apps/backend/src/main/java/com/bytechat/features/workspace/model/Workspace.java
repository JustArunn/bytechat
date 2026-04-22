package com.bytechat.features.workspace.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import com.bytechat.features.user.model.User;
import com.bytechat.features.conversation.model.Conversation;
import com.bytechat.shared.model.BaseEntity;

@Entity
@Table(name = "workspaces")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"members", "conversations"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Workspace extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String slug;

    @Column(unique = true)
    private String joinCode;

    @Column(nullable = false)
    private String adminId;

    @ElementCollection
    @CollectionTable(name = "workspace_co_admins", joinColumns = @JoinColumn(name = "workspace_id"))
    @Column(name = "user_id")
    @Builder.Default
    private Set<String> coAdminIds = new HashSet<>();

    public boolean isAdminOrCoAdmin(String userId) {
        return adminId.equals(userId) || coAdminIds.contains(userId);
    }

    @ManyToMany(mappedBy = "workspaces")
    @Builder.Default
    private Set<User> members = new HashSet<>();

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Conversation> conversations = new HashSet<>();
}
