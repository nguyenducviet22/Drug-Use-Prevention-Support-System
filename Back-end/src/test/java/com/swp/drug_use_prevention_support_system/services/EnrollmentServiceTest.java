package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EnrollmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.EnrollmentMapper;
import com.swp.drug_use_prevention_support_system.repositories.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private EnrollmentMapper enrollmentMapper;
    @Mock
    private UserService userService;
    @Mock
    private CourseService courseService;

    @InjectMocks
    private EnrollmentService enrollmentService;

    @Captor
    private ArgumentCaptor<Enrollment> enrollmentCaptor;

    @Test
    void testCreateEnrollmentWithValidMemberAndCourse() {
        CreateEnrollmentRequest request = mock(CreateEnrollmentRequest.class);
        Enrollment enrollment = new Enrollment();
        EnrollmentResponse response = new EnrollmentResponse();
        User user = new User();
        Course course = new Course();
        UUID courseId = UUID.randomUUID();

        when(request.getCourseID()).thenReturn(courseId);
        when(enrollmentMapper.toEntity(request)).thenReturn(enrollment);
        when(userService.getLoginUsername()).thenReturn("member1");
        when(userService.getUserEntity("member1")).thenReturn(user);
        when(courseService.getCourseEntity(courseId)).thenReturn(course);
        when(enrollmentMapper.toDto(any(Enrollment.class))).thenReturn(response);

        EnrollmentResponse result = enrollmentService.createEnrollment(request);

        assertEquals(response, result);
        verify(enrollmentRepository).save(enrollmentCaptor.capture());
        Enrollment saved = enrollmentCaptor.getValue();
        assertEquals(user, saved.getMember());
        assertEquals(course, saved.getCourse());
        assertEquals(EnrollmentStatus.LEARNING, saved.getStatus());
        assertNotNull(saved.getStartedAt());
        assertNotNull(saved.getEndedAt());
        assertTrue(saved.getEndedAt().isAfter(saved.getStartedAt()));
    }

    @Test
    void testGetAllEnrollmentsAsStaff() {
        Enrollment enrollment1 = new Enrollment();
        Enrollment enrollment2 = new Enrollment();
        List<Enrollment> enrollments = Arrays.asList(enrollment1, enrollment2);
        EnrollmentResponse response1 = new EnrollmentResponse();
        EnrollmentResponse response2 = new EnrollmentResponse();

        when(enrollmentRepository.findAll()).thenReturn(enrollments);
        when(enrollmentMapper.toDto(enrollment1)).thenReturn(response1);
        when(enrollmentMapper.toDto(enrollment2)).thenReturn(response2);

        List<EnrollmentResponse> result = enrollmentService.getAllEnrollments();

        assertEquals(2, result.size());
        assertTrue(result.contains(response1));
        assertTrue(result.contains(response2));
    }

    @Test
    void testUpdateEnrollmentStatusSuccessfully() {
        UUID enrollmentId = UUID.randomUUID();
        Enrollment enrollment = new Enrollment();
        EnrollmentResponse response = new EnrollmentResponse();

        when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));
        when(enrollmentMapper.toDto(enrollment)).thenReturn(response);

        EnrollmentResponse result = enrollmentService.updateEnrollmentStatus(enrollmentId, EnrollmentStatus.COMPLETED);

        assertEquals(response, result);
        assertEquals(EnrollmentStatus.COMPLETED, enrollment.getStatus());
        verify(enrollmentRepository).save(enrollment);
    }

    @Test
    void testGetEnrollmentEntityWithInvalidIdThrowsException() {
        UUID invalidId = UUID.randomUUID();
        when(enrollmentRepository.findById(invalidId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                enrollmentService.getEnrollmentEntity(invalidId));
        assertTrue(ex.getMessage().contains(invalidId.toString()));
    }

    @Test
    void testGetMemberEnrollmentsWithNoEnrollments() {
        String username = "userX";
        when(enrollmentRepository.findByMemberUsername(username)).thenReturn(Collections.emptyList());

        List<EnrollmentResponse> result = enrollmentService.getMemberEnrollments(username);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetEnrollmentByUsernameAndCourseIDReturnsNull() {
        UUID courseId = UUID.randomUUID();
        String username = "userY";
        when(enrollmentRepository.findByMemberUsernameAndCourseCourseID(username, courseId)).thenReturn(null);
        when(enrollmentMapper.toDto(null)).thenReturn(null);

        EnrollmentResponse result = enrollmentService.getEnrollmentByUsernameAndCourseID(courseId, username);

        assertNull(result);
    }

    @Test
    void testGetCourseEnrollmentsReturnsAllEnrollmentsForCourse() {
        UUID courseId = UUID.randomUUID();
        Enrollment enrollment1 = new Enrollment();
        Enrollment enrollment2 = new Enrollment();
        List<Enrollment> enrollments = Arrays.asList(enrollment1, enrollment2);
        EnrollmentResponse response1 = new EnrollmentResponse();
        EnrollmentResponse response2 = new EnrollmentResponse();

        when(enrollmentRepository.findByCourseCourseID(courseId)).thenReturn(enrollments);
        when(enrollmentMapper.toDto(enrollment1)).thenReturn(response1);
        when(enrollmentMapper.toDto(enrollment2)).thenReturn(response2);

        List<EnrollmentResponse> result = enrollmentService.getCourseEnrollments(courseId);

        assertEquals(2, result.size());
        assertTrue(result.contains(response1));
        assertTrue(result.contains(response2));
    }

    @Test
    void testGetCompletedEnrollmentByAgeGroupWithNoCompletedEnrollments() {
        when(enrollmentRepository.getCompletedEnrollmentCountByAgeGroup()).thenReturn(Collections.emptyList());

        Map<String, Object> result = enrollmentService.getCompletedEnrollmentByAgeGroup();

        @SuppressWarnings("unchecked")
        List<String> labels = (List<String>) result.get("labels");
        @SuppressWarnings("unchecked")
        List<Integer> data = (List<Integer>) result.get("data");

        assertEquals(Arrays.asList("ADOLESCENT", "ADULT", "SENIOR", "EVERYONE"), labels);
        assertEquals(Arrays.asList(0, 0, 0, 0), data);
    }

    @Test
    void testGetCompletedEnrollmentByAgeGroupReturnsCorrectStatisticsForAdmin() {
        List<Object[]> repoResult = new ArrayList<>();
        repoResult.add(new Object[]{AgeGroup.ADOLESCENT, 3L});
        repoResult.add(new Object[]{AgeGroup.ADULT, 5L});
        repoResult.add(new Object[]{AgeGroup.SENIOR, 2L});
        repoResult.add(new Object[]{AgeGroup.EVERYONE, 1L});
        when(enrollmentRepository.getCompletedEnrollmentCountByAgeGroup()).thenReturn(repoResult);

        Map<String, Object> result = enrollmentService.getCompletedEnrollmentByAgeGroup();

        @SuppressWarnings("unchecked")
        List<String> labels = (List<String>) result.get("labels");
        @SuppressWarnings("unchecked")
        List<Integer> data = (List<Integer>) result.get("data");

        assertEquals(Arrays.asList("ADOLESCENT", "ADULT", "SENIOR", "EVERYONE"), labels);
        assertEquals(Arrays.asList(3, 5, 2, 1), data);
    }

    @Test
    void testCreateEnrollmentWithInvalidCourseIdThrowsException() {
        CreateEnrollmentRequest request = mock(CreateEnrollmentRequest.class);
        UUID courseId = UUID.randomUUID();
        when(request.getCourseID()).thenReturn(courseId);
        when(enrollmentMapper.toEntity(request)).thenReturn(new Enrollment());
        when(userService.getLoginUsername()).thenReturn("member2");
        when(userService.getUserEntity("member2")).thenReturn(new User());
        when(courseService.getCourseEntity(courseId)).thenThrow(new EntityNotFoundException("Course does not exist"));

        assertThrows(EntityNotFoundException.class, () -> enrollmentService.createEnrollment(request));
    }

    @Test
    void testGetEnrollmentByIdAsMemberReturnsEnrollment() {
        UUID enrollmentId = UUID.randomUUID();
        Enrollment enrollment = new Enrollment();
        EnrollmentResponse response = new EnrollmentResponse();

        when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));
        when(enrollmentMapper.toDto(enrollment)).thenReturn(response);

        EnrollmentResponse result = enrollmentService.getEnrollment(enrollmentId);

        assertEquals(response, result);
    }

    @Test
    void testUpdateEnrollmentStatusWithInvalidIdThrowsException() {
        UUID invalidId = UUID.randomUUID();
        when(enrollmentRepository.findById(invalidId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
                enrollmentService.updateEnrollmentStatus(invalidId, EnrollmentStatus.CANCELED));
    }

    @Test
    void testGetMemberEnrollmentsReturnsAllEnrollmentsForMember() {
        String username = "memberX";
        Enrollment enrollment1 = new Enrollment();
        Enrollment enrollment2 = new Enrollment();
        List<Enrollment> enrollments = Arrays.asList(enrollment1, enrollment2);
        EnrollmentResponse response1 = new EnrollmentResponse();
        EnrollmentResponse response2 = new EnrollmentResponse();

        when(enrollmentRepository.findByMemberUsername(username)).thenReturn(enrollments);
        when(enrollmentMapper.toDto(enrollment1)).thenReturn(response1);
        when(enrollmentMapper.toDto(enrollment2)).thenReturn(response2);

        List<EnrollmentResponse> result = enrollmentService.getMemberEnrollments(username);

        assertEquals(2, result.size());
        assertTrue(result.contains(response1));
        assertTrue(result.contains(response2));
    }

    @Test
    void testGetEnrollmentByIdWithNonExistentIdThrowsException() {
        UUID nonExistentId = UUID.randomUUID();
        when(enrollmentRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> enrollmentService.getEnrollment(nonExistentId));
    }

    @Test
    void testGetEnrollmentByUsernameAndCourseIDReturnsEnrollment() {
        UUID courseId = UUID.randomUUID();
        String username = "memberY";
        Enrollment enrollment = new Enrollment();
        EnrollmentResponse response = new EnrollmentResponse();

        when(enrollmentRepository.findByMemberUsernameAndCourseCourseID(username, courseId)).thenReturn(enrollment);
        when(enrollmentMapper.toDto(enrollment)).thenReturn(response);

        EnrollmentResponse result = enrollmentService.getEnrollmentByUsernameAndCourseID(courseId, username);

        assertEquals(response, result);
    }

    @Test
    void testUpdateEnrollmentStatusWithInsufficientPermissionsThrowsException() {
        // Simulate security layer throwing AccessDeniedException
        UUID enrollmentId = UUID.randomUUID();
        doThrow(new AccessDeniedException("Access is denied")).when(enrollmentRepository).findById(enrollmentId);

        assertThrows(AccessDeniedException.class, () ->
                enrollmentService.updateEnrollmentStatus(enrollmentId, EnrollmentStatus.EXPIRED));
    }
}