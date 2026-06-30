package com.college.platform.repository;

import com.college.platform.model.AdBoost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdBoostRepository extends JpaRepository<AdBoost, Long> {
    long countByStatus(String status);
}
