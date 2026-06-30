package com.college.platform.controller;

import com.college.platform.model.FollowUpConfig;
import com.college.platform.repository.FollowUpConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    @Autowired
    private FollowUpConfigRepository repository;

    @GetMapping("/follow-up")
    public ResponseEntity<FollowUpConfig> getFollowUpConfig() {
        List<FollowUpConfig> configs = repository.findAll();
        if (configs.isEmpty()) {
            // Return default config if none exists
            FollowUpConfig defaultConfig = new FollowUpConfig();
            defaultConfig.setAutoSend(true);
            defaultConfig.setDelayHours(1);
            defaultConfig.setMaxFollowUps(2);
            defaultConfig.setAccuracyThreshold(10);
            return ResponseEntity.ok(defaultConfig);
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PostMapping("/follow-up")
    public ResponseEntity<FollowUpConfig> saveFollowUpConfig(@RequestBody FollowUpConfig newConfig) {
        List<FollowUpConfig> configs = repository.findAll();
        FollowUpConfig configToSave;
        if (configs.isEmpty()) {
            configToSave = newConfig;
        } else {
            configToSave = configs.get(0);
            configToSave.setAutoSend(newConfig.isAutoSend());
            configToSave.setDelayHours(newConfig.getDelayHours());
            configToSave.setMaxFollowUps(newConfig.getMaxFollowUps());
            configToSave.setAccuracyThreshold(newConfig.getAccuracyThreshold());
        }
        FollowUpConfig saved = repository.save(configToSave);
        return ResponseEntity.ok(saved);
    }
}
