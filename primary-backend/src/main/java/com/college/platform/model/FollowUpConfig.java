package com.college.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "follow_up_config")
public class FollowUpConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean autoSend;
    private int delayHours;
    private int maxFollowUps;
    private int accuracyThreshold;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public boolean isAutoSend() { return autoSend; }
    public void setAutoSend(boolean autoSend) { this.autoSend = autoSend; }

    public int getDelayHours() { return delayHours; }
    public void setDelayHours(int delayHours) { this.delayHours = delayHours; }

    public int getMaxFollowUps() { return maxFollowUps; }
    public void setMaxFollowUps(int maxFollowUps) { this.maxFollowUps = maxFollowUps; }

    public int getAccuracyThreshold() { return accuracyThreshold; }
    public void setAccuracyThreshold(int accuracyThreshold) { this.accuracyThreshold = accuracyThreshold; }
}
