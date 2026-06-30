package com.college.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ad_boosts")
public class AdBoost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ACTIVE, PENDING
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
