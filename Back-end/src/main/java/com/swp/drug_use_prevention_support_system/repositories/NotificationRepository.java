package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
}
