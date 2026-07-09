package com.college.platform.controller;

import com.college.platform.model.AutopilotConfig;
import com.college.platform.repository.AutopilotConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/autopilot")
@CrossOrigin(origins = "*")
public class AutopilotController {

    @Autowired
    private AutopilotConfigRepository repository;

    @GetMapping
    public ResponseEntity<AutopilotConfig> getConfig() {
        List<AutopilotConfig> configs = repository.findAll();
        if (configs.isEmpty()) {
            AutopilotConfig defaultConfig = new AutopilotConfig();
            defaultConfig.setDailyPostingEnabled(false);
            defaultConfig.setPageProfileText("");
            defaultConfig.setScheduleTimes("");
            return ResponseEntity.ok(defaultConfig);
        }
        return ResponseEntity.ok(configs.get(0));
    }

    @PostMapping
    public ResponseEntity<AutopilotConfig> saveConfig(@RequestBody AutopilotConfig newConfig) {
        List<AutopilotConfig> configs = repository.findAll();
        AutopilotConfig configToSave;
        if (configs.isEmpty()) {
            configToSave = newConfig;
        } else {
            configToSave = configs.get(0);
            configToSave.setDailyPostingEnabled(newConfig.isDailyPostingEnabled());
            configToSave.setPageProfileText(newConfig.getPageProfileText());
            configToSave.setScheduleTimes(newConfig.getScheduleTimes());
            configToSave.setPublishMode(newConfig.getPublishMode());
        }
        return ResponseEntity.ok(repository.save(configToSave));
    }
}
