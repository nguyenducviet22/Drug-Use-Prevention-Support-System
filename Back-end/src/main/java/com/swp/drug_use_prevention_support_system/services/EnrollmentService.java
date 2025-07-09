package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EnrollmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.EnrollmentMapper;
import com.swp.drug_use_prevention_support_system.repositories.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentMapper enrollmentMapper;
    private final UserService userService;
    private final CourseService courseService;

    @PreAuthorize("hasRole('MEMBER')")
    public EnrollmentResponse createEnrollment(CreateEnrollmentRequest request) {
        Enrollment enrollment = enrollmentMapper.toEntity(request);
        String loginUsername = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(loginUsername);
        Course course = courseService.getCourseEntity(request.getCourseID());
        enrollment.setMember(loginUser);
        enrollment.setCourse(course);
        enrollment.setStartedAt(Instant.now());
        enrollment.setEndedAt(Instant.now().plus(14, ChronoUnit.DAYS));
        enrollment.setStatus(EnrollmentStatus.LEARNING);
        enrollmentRepository.save(enrollment);
        return enrollmentMapper.toDto(enrollment);
    }

    @PreAuthorize("hasRole('STAFF')")
    public List<EnrollmentResponse> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        return enrollments.stream()
                .map(enrollment -> enrollmentMapper.toDto(enrollment))
                .toList();
    }

    public List<EnrollmentResponse> getMemberEnrollments(String username) {
        List<Enrollment> enrollments = enrollmentRepository.findByMemberUsername(username);
        return enrollments.stream()
                .map(enrollment -> enrollmentMapper.toDto(enrollment))
                .toList();
    }

    public List<EnrollmentResponse> getCourseEnrollments(UUID courseId) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseID(courseId);
        return enrollments.stream()
                .map(enrollment -> enrollmentMapper.toDto(enrollment))
                .toList();
    }

    public Enrollment getEnrollmentEntity(UUID enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment does not exist with ID: " + enrollmentId));
    }

    @PreAuthorize("hasRole('MEMBER')")
    public EnrollmentResponse getEnrollment(UUID enrollmentId) {
        Enrollment enrollment = getEnrollmentEntity(enrollmentId);
        return enrollmentMapper.toDto(enrollment);
    }

    @PreAuthorize("hasAnyRole('STAFF', 'MEMBER')")
    public EnrollmentResponse getEnrollmentByUsernameAndCourseID(UUID courseID, String username) {
        Enrollment enrollment = enrollmentRepository.findByMemberUsernameAndCourseCourseID(username, courseID);
//        if (enrollment == null) {
//            throw new EntityNotFoundException("Enrollment does not exist with username " + username + " courseID " +courseID);
//        }
        return enrollmentMapper.toDto(enrollment);
    }

    @PostAuthorize("returnObject.member.username == authentication.name")
    public EnrollmentResponse updateEnrollmentStatus(UUID enrollmentId, EnrollmentStatus status) {
        Enrollment enrollment = getEnrollmentEntity(enrollmentId);
        enrollment.setStatus(status);
        enrollmentRepository.save(enrollment);
        return enrollmentMapper.toDto(enrollment);
    }
}
