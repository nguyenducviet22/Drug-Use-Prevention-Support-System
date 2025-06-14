package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Event;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query("SELECT e FROM Event e WHERE e.createdBy = :createdBy")
    List<Event> findEventsCreatedBy(@Param("createdBy") User createdBy);

    @Query("SELECT e FROM Event e WHERE e.createdBy.username = :username")
    List<Event> findEventsByCreatedByUsername(@Param("username") String username);
}
