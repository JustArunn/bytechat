package com.bytechat.features.message.model;

import com.bytechat.shared.model.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "message")
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Attachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;
}
