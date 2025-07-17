package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByMemberUsername(String username);

    List<Enrollment> findByCourseCourseID(UUID courseId);

    @Query("SELECT e.course FROM Enrollment e " +
            "WHERE e.status = :status AND e.member.username = :username")
    List<Course> findEnrolledCoursesByStatusAndMember(@Param("status") EnrollmentStatus status,
                                                      @Param("username") String username);

    Enrollment findByMemberUsernameAndCourseCourseID(String username, UUID courseID);

    @Query("""
        SELECT e.member.ageGroup, COUNT(DISTINCT e.member.username)
        FROM Enrollment e
        WHERE e.status = 'COMPLETED'
        GROUP BY e.member.ageGroup
    """)
    List<Object[]> getCompletedEnrollmentCountByAgeGroup();
}
