package com.bytechat.features.workspace.model;

import com.bytechat.shared.model.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workspace_invites")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceInvite extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String workspaceId;

    @Column(nullable = false)
    @Builder.Default
    private boolean accepted = false;
}
