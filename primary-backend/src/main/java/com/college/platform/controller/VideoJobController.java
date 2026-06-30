package com.college.platform.controller;

import com.college.platform.service.VideoGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/video")
@CrossOrigin(origins = "*")
public class VideoJobController {
    private final VideoGenerationService videoService;

    public VideoJobController(VideoGenerationService videoService) {
        this.videoService = videoService;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateVideo(@RequestBody Map<String, String> payload) {
        String script = payload.getOrDefault("script", "Default Script from ITCollegetest");
        String jobId = videoService.startVideoJob(script);
        return ResponseEntity.ok(Map.of("jobId", jobId, "status", "queued"));
    }
}
