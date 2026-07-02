package com.college.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

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
    private Boolean fromAi;

    @Column(name = "requires_human")
    private Boolean requiresHuman;

    @Column(name = "is_resolved")
    private Boolean resolved;

    @Column(name = "lead_status")
    private String leadStatus;

    @Column(name = "payment_slip_url", columnDefinition = "TEXT")
    private String paymentSlipUrl;

    @Column(name = "payment_verified")
    private Boolean paymentVerified;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public FacebookMessage() {
    }

    public FacebookMessage(UUID id, String senderId, String recipientId, String messageText, Boolean fromAi, Boolean requiresHuman, Boolean resolved, String leadStatus, String paymentSlipUrl, Boolean paymentVerified, LocalDateTime createdAt) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.messageText = messageText;
        this.fromAi = fromAi;
        this.requiresHuman = requiresHuman;
        this.resolved = resolved;
        this.leadStatus = leadStatus;
        this.paymentSlipUrl = paymentSlipUrl;
        this.paymentVerified = paymentVerified;
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

    public Boolean isFromAi() { return fromAi; }
    public void setFromAi(Boolean fromAi) { this.fromAi = fromAi; }

    public Boolean isRequiresHuman() { return requiresHuman; }
    public void setRequiresHuman(Boolean requiresHuman) { this.requiresHuman = requiresHuman; }

    public Boolean isResolved() { return resolved; }
    public void setResolved(Boolean resolved) { this.resolved = resolved; }

    public String getLeadStatus() { return leadStatus; }
    public void setLeadStatus(String leadStatus) { this.leadStatus = leadStatus; }

    public String getPaymentSlipUrl() { return paymentSlipUrl; }
    public void setPaymentSlipUrl(String paymentSlipUrl) { this.paymentSlipUrl = paymentSlipUrl; }

    public Boolean isPaymentVerified() { return paymentVerified; }
    public void setPaymentVerified(Boolean paymentVerified) { this.paymentVerified = paymentVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
