package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByAgeGroupOrderByCreatedAtDesc(AgeGroup ageGroup);

    List<Course> findByStatusOrderByCreatedAtDesc(CourseStatus status);

    List<Course> findByStatusAndCreatedAtBetween(CourseStatus status, Instant start, Instant end);

    List<Course> findByCreatedAtBetween(Instant start, Instant end);
}
