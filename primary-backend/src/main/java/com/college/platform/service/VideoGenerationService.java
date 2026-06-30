package com.college.platform.service;

import com.college.platform.model.VideoJobStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class VideoGenerationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);
    
    private static final List<String> STATES = Arrays.asList(
        "QUEUED", "SYNTHESIZING", "TRANSCRIBING", "PLANNING", "FETCHING ASSETS", "RENDERING", "COMPLETED"
    );

    public VideoGenerationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public String startVideoJob(String script) {
        String jobId = UUID.randomUUID().toString();
        simulatePipeline(jobId);
        return jobId;
    }

    private void simulatePipeline(String jobId) {
        for (int i = 0; i < STATES.size(); i++) {
            final int index = i;
            scheduler.schedule(() -> {
                VideoJobStatus status = new VideoJobStatus();
                status.setJobId(jobId);
                status.setState(STATES.get(index));
                status.setProgress((index * 100) / (STATES.size() - 1));
                status.setMessage("Stage: " + STATES.get(index));
                
                messagingTemplate.convertAndSend("/topic/video-jobs", status);
            }, i * 3, TimeUnit.SECONDS); // 3 seconds per stage mock
        }
    }
}
