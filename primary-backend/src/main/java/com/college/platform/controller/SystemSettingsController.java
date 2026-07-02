package com.college.platform.controller;

import com.college.platform.model.SystemSettings;
import com.college.platform.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsRepository settingsRepository;

    @GetMapping("/facebook-tokens")
    public ResponseEntity<Map<String, String>> getFacebookTokens() {
        String syncToken = settingsRepository.findBySettingKey("FB_SYNC_TOKEN")
                .map(SystemSettings::getSettingValue).orElse("");
        String publishToken = settingsRepository.findBySettingKey("FB_PUBLISH_TOKEN")
                .map(SystemSettings::getSettingValue).orElse("");
                
        return ResponseEntity.ok(Map.of("syncToken", syncToken, "publishToken", publishToken));
    }

    @PostMapping("/facebook-tokens")
    public ResponseEntity<Map<String, String>> updateFacebookTokens(@RequestBody Map<String, String> body) {
        if (body.containsKey("syncToken")) {
            SystemSettings syncSetting = settingsRepository.findBySettingKey("FB_SYNC_TOKEN")
                    .orElse(new SystemSettings("FB_SYNC_TOKEN", ""));
            syncSetting.setSettingValue(body.get("syncToken"));
            settingsRepository.save(syncSetting);
        }
        
        if (body.containsKey("publishToken")) {
            SystemSettings pubSetting = settingsRepository.findBySettingKey("FB_PUBLISH_TOKEN")
                    .orElse(new SystemSettings("FB_PUBLISH_TOKEN", ""));
            pubSetting.setSettingValue(body.get("publishToken"));
            settingsRepository.save(pubSetting);
        }

        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
