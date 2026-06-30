package com.college.platform.repository;

import com.college.platform.model.FollowUpConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowUpConfigRepository extends JpaRepository<FollowUpConfig, Long> {
}
