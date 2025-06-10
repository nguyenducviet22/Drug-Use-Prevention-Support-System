package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEnrollmentRequest;
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
        enrollment.setMember(loginUser);

        UUID courseID = request.getCourseId();
        Course course = courseService.getCourseEntity(courseID);
        enrollment.setCourse(course);

        enrollment.setStatus(EnrollmentStatus.ENROLLED);
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

    @PreAuthorize("hasRole('STAFF')")
    public EnrollmentResponse updateEnrollment(UUID enrollmentId, UpdateEnrollmentRequest request) {
        Enrollment enrollment = getEnrollmentEntity(enrollmentId);
        enrollment.setStatus(request.getStatus());
        enrollmentRepository.save(enrollment);
        return enrollmentMapper.toDto(enrollment);
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public EnrollmentResponse deleteEnrollment(UUID enrollmentId) {
        Enrollment enrollment = getEnrollmentEntity(enrollmentId);
        enrollment.setStatus(EnrollmentStatus.UNENROLLED);
        enrollmentRepository.save(enrollment);
        return enrollmentMapper.toDto(enrollment);
    }
}
