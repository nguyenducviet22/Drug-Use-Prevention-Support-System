package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByMemberUsername(String username);

    List<Enrollment> findByCourseCourseID(UUID courseId);

    @Query("SELECT e.course FROM Enrollment e " +
            "GROUP BY e.course " +
            "ORDER BY COUNT(e.course) DESC")
    List<Course> findTop3MostEnrolledCourses(Pageable pageable);

    @Query("SELECT e.course FROM Enrollment e " +
            "WHERE e.status = :status AND e.member.username = :username")
    List<Course> findEnrolledCoursesByStatusAndMember(@Param("status") EnrollmentStatus status,
                                                      @Param("username") String username);

}
