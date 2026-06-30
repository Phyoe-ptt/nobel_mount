package com.college.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "facebook_messages")
public class FacebookMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(name = "recipient_id", nullable = false)
    private String recipientId;

    @Column(name = "message_text", columnDefinition = "TEXT")
    private String messageText;

    @Column(name = "is_from_ai")
    private boolean fromAi;

    @Column(name = "requires_human")
    private boolean requiresHuman;

    @Column(name = "is_resolved")
    private boolean resolved;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public FacebookMessage() {
    }

    public FacebookMessage(UUID id, String senderId, String recipientId, String messageText, boolean fromAi, boolean requiresHuman, boolean resolved, LocalDateTime createdAt) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.messageText = messageText;
        this.fromAi = fromAi;
        this.requiresHuman = requiresHuman;
        this.resolved = resolved;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public boolean isFromAi() { return fromAi; }
    public void setFromAi(boolean fromAi) { this.fromAi = fromAi; }

    public boolean isRequiresHuman() { return requiresHuman; }
    public void setRequiresHuman(boolean requiresHuman) { this.requiresHuman = requiresHuman; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
