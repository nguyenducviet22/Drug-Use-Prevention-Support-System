package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Event;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query("SELECT e FROM Event e WHERE e.createdByStaff = :createdBy")
    List<Event> findEventsCreatedBy(@Param("createdBy") User createdBy);

    @Query("SELECT e FROM Event e WHERE e.createdByStaff.username = :username")
    List<Event> findEventsByCreatedByUsername(@Param("username") String username);

    List<Event> findByStartDateAfter(LocalDateTime startDate);

    @NonNull
    Optional<Event> findById(UUID id);

    List<Event> findByAgeGroupIn(List<AgeGroup> ageGroups);

    List<Event> findByStatusOrderByCreatedAtDesc(EventStatus status);
}
