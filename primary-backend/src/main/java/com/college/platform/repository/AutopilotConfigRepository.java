package com.college.platform.repository;

import com.college.platform.model.AutopilotConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AutopilotConfigRepository extends JpaRepository<AutopilotConfig, Long> {
}
