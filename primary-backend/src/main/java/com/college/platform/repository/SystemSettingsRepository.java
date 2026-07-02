package com.college.platform.repository;

import com.college.platform.model.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
    Optional<SystemSettings> findBySettingKey(String settingKey);
}
