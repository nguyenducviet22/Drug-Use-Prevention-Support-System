package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.EventUser;
import com.swp.drug_use_prevention_support_system.domain.entities.EventUserId;
import com.swp.drug_use_prevention_support_system.domain.enums.EventUserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventUserRepository extends JpaRepository<EventUser, EventUserId> {
    long countByEventId(UUID eventId);
    long countByEventIdAndStatus(UUID eventId, EventUserStatus status);
    List<EventUser> findByMemberId(String memberId);
}

