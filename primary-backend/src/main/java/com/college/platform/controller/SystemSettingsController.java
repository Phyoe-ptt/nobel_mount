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

    @GetMapping("/facebook-token")
    public ResponseEntity<Map<String, String>> getFacebookToken() {
        Optional<SystemSettings> setting = settingsRepository.findBySettingKey("FB_PAGE_ACCESS_TOKEN");
        return setting.map(s -> ResponseEntity.ok(Map.of("token", s.getSettingValue())))
                .orElseGet(() -> ResponseEntity.ok(Map.of("token", "")));
    }

    @PostMapping("/facebook-token")
    public ResponseEntity<Map<String, String>> updateFacebookToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null) {
            return ResponseEntity.badRequest().build();
        }

        SystemSettings setting = settingsRepository.findBySettingKey("FB_PAGE_ACCESS_TOKEN")
                .orElse(new SystemSettings("FB_PAGE_ACCESS_TOKEN", ""));
        setting.setSettingValue(token);
        settingsRepository.save(setting);

        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
