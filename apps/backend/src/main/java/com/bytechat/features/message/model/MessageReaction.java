package com.bytechat.features.message.model;

import jakarta.persistence.*;
import lombok.*;
import com.bytechat.features.user.model.User;
import com.bytechat.shared.model.BaseEntity;

@Entity
@Table(name = "message_reactions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"message_id", "user_id", "emoji"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class MessageReaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 32)
    private String emoji;
}
