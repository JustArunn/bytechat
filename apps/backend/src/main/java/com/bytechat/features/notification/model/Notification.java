package com.bytechat.features.notification.model;

import jakarta.persistence.*;
import lombok.*;
import com.bytechat.features.user.model.User;
import com.bytechat.shared.model.BaseEntity;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The recipient of the notification

    @Column(nullable = false)
    private String actorName; // Name of the user who triggered it

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String message;

    private String link;

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false;

    public enum NotificationType {
        MESSAGE,
        REACTION,
        MENTION
    }
}
