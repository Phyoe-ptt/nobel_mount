package com.college.platform.repository;

import com.college.platform.model.InboxMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InboxMessageRepository extends JpaRepository<InboxMessage, Long> {
    long countByIsUnreadTrue();
}
