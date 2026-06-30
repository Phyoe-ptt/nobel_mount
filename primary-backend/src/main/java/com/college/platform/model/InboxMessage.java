package com.college.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inbox_messages")
public class InboxMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_unread")
    private Boolean isUnread;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Boolean getIsUnread() { return isUnread; }
    public void setIsUnread(Boolean isUnread) { this.isUnread = isUnread; }
}
