package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.domain.entities.UserCourseId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UserCourseId> {
    List<Enrollment> findByMemberUsername(String username);

    List<Enrollment> findByCourseCourseID(UUID courseId);
}
