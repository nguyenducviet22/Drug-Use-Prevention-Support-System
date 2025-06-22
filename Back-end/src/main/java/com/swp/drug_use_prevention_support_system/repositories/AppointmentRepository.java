package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByMemberUsername(String username);

    Appointment findByMemberUsernameAndAppointmentDateTimeBetween(String username, LocalDateTime startOfDay, LocalDateTime endOfDay);

    List<Appointment> findByConsultantUsernameAndAppointmentDateTimeBetween(String username, Instant start, Instant end);
}
