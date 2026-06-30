package com.college.platform.repository;

import com.college.platform.model.FacebookMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FacebookMessageRepository extends JpaRepository<FacebookMessage, UUID> {
    // Custom query to get all messages ordered by created at descending
    List<FacebookMessage> findAllByOrderByCreatedAtDesc();
}
