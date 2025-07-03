package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByMemberUsernameOrderByAppointmentDateTimeAsc(String username);

    List<Appointment> findByMemberUsernameAndAppointmentDateTimeBetween(String username, Instant startOfDay, Instant endOfDay);

    List<Appointment> findByCreatedAtBetween(Instant start, Instant end);

    List<Appointment> findByConsultantUsername(String username);

    long countByConsultantUsername(String username);

    @Query("SELECT COUNT(DISTINCT a.member.id) FROM Appointment a WHERE a.consultant.username = :username")
    long countDistinctMembersByConsultantUsername(@Param("username") String username);

    List<Appointment> findByConsultantUsernameAndAppointmentDateTimeBetween(String username, Instant startOfDay, Instant endOfDay);

    Appointment findByConsultantUsernameAndAppointmentDateTime(String username, Instant time);

    Appointment findByMemberUsernameAndAppointmentDateTime(String username, Instant time);
}
