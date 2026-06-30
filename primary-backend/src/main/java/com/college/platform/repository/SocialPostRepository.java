package com.college.platform.repository;

import com.college.platform.model.SocialPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialPostRepository extends JpaRepository<SocialPost, Long> {
    long countByStatus(String status);
    List<SocialPost> findTop3ByOrderByCreatedAtDesc();
}
