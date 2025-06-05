package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
}
