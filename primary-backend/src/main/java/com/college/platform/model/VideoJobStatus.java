package com.college.platform.model;

public class VideoJobStatus {
    private String jobId;
    private String state;
    private int progress;
    private String message;

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
