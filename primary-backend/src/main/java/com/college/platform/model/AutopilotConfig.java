package com.college.platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "autopilot_config")
public class AutopilotConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String publishMode;
    private String schedule;
    private String timezone;
    private String lastRun;

    @Column(name = "daily_posting_enabled")
    private boolean dailyPostingEnabled;

    @Column(name = "page_profile_text", columnDefinition = "TEXT")
    private String pageProfileText;

    @Column(name = "schedule_times")
    private String scheduleTimes;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPublishMode() { return publishMode; }
    public void setPublishMode(String publishMode) { this.publishMode = publishMode; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getLastRun() { return lastRun; }
    public void setLastRun(String lastRun) { this.lastRun = lastRun; }

    public boolean isDailyPostingEnabled() { return dailyPostingEnabled; }
    public void setDailyPostingEnabled(boolean dailyPostingEnabled) { this.dailyPostingEnabled = dailyPostingEnabled; }

    public String getPageProfileText() { return pageProfileText; }
    public void setPageProfileText(String pageProfileText) { this.pageProfileText = pageProfileText; }

    public String getScheduleTimes() { return scheduleTimes; }
    public void setScheduleTimes(String scheduleTimes) { this.scheduleTimes = scheduleTimes; }
}
