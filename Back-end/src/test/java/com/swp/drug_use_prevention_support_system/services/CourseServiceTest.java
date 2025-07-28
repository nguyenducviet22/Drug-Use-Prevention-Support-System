package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CourseResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.Module;
import com.swp.drug_use_prevention_support_system.domain.entities.Lesson;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.CourseMapper;
import com.swp.drug_use_prevention_support_system.repositories.CourseRepository;
import com.swp.drug_use_prevention_support_system.repositories.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.time.YearMonth;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CourseMapper courseMapper;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private ModuleService moduleService;
    @Mock
    private LessonService lessonService;

    @InjectMocks
    private CourseService courseService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateCourseWithValidData() {
        CreateCourseRequest request = CreateCourseRequest.builder()
                .courseName("Test Course")
                .duration(10)
                .quantity(5)
                .image("img.png")
                .description("desc")
                .ageGroup(AgeGroup.ADULT)
                .build();
        Course mappedCourse = Course.builder()
                .courseName("Test Course")
                .duration(10)
                .quantity(5)
                .image("img.png")
                .description("desc")
                .ageGroup(AgeGroup.ADULT)
                .build();
        Course savedCourse = Course.builder()
                .courseID(UUID.randomUUID())
                .courseName("Test Course")
                .duration(0)
                .quantity(5)
                .image("img.png")
                .description("desc")
                .ageGroup(AgeGroup.ADULT)
                .status(CourseStatus.PENDING)
                .build();
        CourseResponse response = CourseResponse.builder()
                .courseID(savedCourse.getCourseID())
                .courseName("Test Course")
                .duration(0)
                .quantity(5)
                .image("img.png")
                .description("desc")
                .ageGroup(AgeGroup.ADULT)
                .status(CourseStatus.PENDING)
                .build();

        when(courseMapper.toEntity(request)).thenReturn(mappedCourse);
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);
        when(courseMapper.toDto(any(Course.class))).thenReturn(response);

        CourseResponse result = courseService.createCourse(request);

        assertEquals(response, result);
        verify(courseRepository).save(any(Course.class));
        verify(courseMapper).toDto(any(Course.class));
    }

    @Test
    void testUpdateCourseWithValidData() {
        UUID courseId = UUID.randomUUID();
        UpdateCourseRequest request = UpdateCourseRequest.builder()
                .courseID(courseId)
                .courseName("Updated Name")
                .duration(20)
                .quantity(10)
                .image("updated.png")
                .description("Updated desc")
                .ageGroup(AgeGroup.SENIOR)
                .build();
        Course course = Course.builder()
                .courseID(courseId)
                .courseName("Old Name")
                .duration(5)
                .quantity(2)
                .image("old.png")
                .description("Old desc")
                .ageGroup(AgeGroup.ADULT)
                .build();
        Course updatedCourse = Course.builder()
                .courseID(courseId)
                .courseName("Updated Name")
                .duration(30)
                .quantity(10)
                .image("updated.png")
                .description("Updated desc")
                .ageGroup(AgeGroup.SENIOR)
                .build();
        CourseResponse response = CourseResponse.builder()
                .courseID(courseId)
                .courseName("Updated Name")
                .duration(30)
                .quantity(10)
                .image("updated.png")
                .description("Updated desc")
                .ageGroup(AgeGroup.SENIOR)
                .build();

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(moduleService.getAllModulesByCourseID(courseId, CourseStatus.AVAILABLE)).thenReturn(Collections.emptyList());
        when(courseRepository.save(any(Course.class))).thenReturn(updatedCourse);
        when(courseMapper.toDto(any(Course.class))).thenReturn(response);

        CourseResponse result = courseService.updateCourse(courseId, request);

        assertEquals(response, result);
        verify(courseRepository).save(any(Course.class));
        verify(courseMapper).toDto(any(Course.class));
    }

    @Test
    void testGetCoursesByAgeGroupReturnsAvailableCourses() {
        AgeGroup ageGroup = AgeGroup.ADULT;
        Course course1 = Course.builder().courseID(UUID.randomUUID()).ageGroup(ageGroup).status(CourseStatus.AVAILABLE).build();
        Course course2 = Course.builder().courseID(UUID.randomUUID()).ageGroup(ageGroup).status(CourseStatus.AVAILABLE).build();
        List<Course> courses = Arrays.asList(course1, course2);
        CourseResponse resp1 = CourseResponse.builder().courseID(course1.getCourseID()).ageGroup(ageGroup).status(CourseStatus.AVAILABLE).build();
        CourseResponse resp2 = CourseResponse.builder().courseID(course2.getCourseID()).ageGroup(ageGroup).status(CourseStatus.AVAILABLE).build();

        when(courseRepository.findByAgeGroupAndStatusOrderByCreatedAtDesc(ageGroup, CourseStatus.AVAILABLE)).thenReturn(courses);
        when(courseMapper.toDto(course1)).thenReturn(resp1);
        when(courseMapper.toDto(course2)).thenReturn(resp2);

        List<CourseResponse> result = courseService.getCoursesByAgeGroup(ageGroup);

        assertEquals(2, result.size());
        assertTrue(result.contains(resp1));
        assertTrue(result.contains(resp2));
    }

    @Test
    void testGetCourseEntityThrowsWhenCourseNotFound() {
        UUID courseId = UUID.randomUUID();
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> courseService.getCourseEntity(courseId));
    }

    @Test
    void testUpdateCourseStatusThrowsWhenCourseNotFound() {
        UUID courseId = UUID.randomUUID();
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> courseService.updateCourseStatus(courseId, CourseStatus.AVAILABLE));
    }

    @Test
    void testCalculateCourseDurationWithNoModulesOrLessons() {
        UUID courseId = UUID.randomUUID();
        when(moduleService.getAllModulesByCourseID(courseId, CourseStatus.AVAILABLE)).thenReturn(Collections.emptyList());

        Integer duration = courseService.calculateCourseDuration(courseId);

        assertEquals(0, duration);
    }

    @Test
    void testGetCourseStatsReturnsCorrectMetrics() {
        when(courseRepository.count()).thenReturn(10L);
        when(courseRepository.countByStatus(CourseStatus.AVAILABLE)).thenReturn(7);
        YearMonth now = YearMonth.now();
        YearMonth last = now.minusMonths(1);
        when(courseRepository.countCoursesByMonth(now.getYear(), now.getMonthValue())).thenReturn(5);
        when(courseRepository.countCoursesByMonth(last.getYear(), last.getMonthValue())).thenReturn(2);

        Map<String, Object> stats = courseService.getCourseStats();

        assertEquals(10L, stats.get("totalCourses"));
        assertEquals(7L, stats.get("activeCourses"));
        assertEquals(Math.round((double)(5-2)/2*100), stats.get("growthPercent"));
    }

    @Test
    void testGetCoursesForMemberByStatusReturnsEmptyListWhenNoEnrollments() {
        String username = "user";
        EnrollmentStatus status = EnrollmentStatus.COMPLETED;
        when(enrollmentRepository.findEnrolledCoursesByStatusAndMember(status, username)).thenReturn(Collections.emptyList());

        List<CourseResponse> result = courseService.getCoursesForMemberByStatus(status, username);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetAllCoursesByDateDurationReturnsCorrectCourses() {
        Instant start = Instant.now().minusSeconds(10000);
        Instant end = Instant.now();
        Course course = Course.builder().courseID(UUID.randomUUID()).build();
        List<Course> courses = Collections.singletonList(course);
        CourseResponse response = CourseResponse.builder().courseID(course.getCourseID()).build();

        when(courseRepository.findByCreatedAtBetween(start, end)).thenReturn(courses);
        when(courseMapper.toDto(course)).thenReturn(response);

        List<CourseResponse> result = courseService.getAllCoursesByDateDuration(start, end);

        assertEquals(1, result.size());
        assertEquals(response, result.get(0));
    }

    @Test
    void testUpdateCourseIgnoresMismatchedRequestCourseID() {
        UUID methodCourseId = UUID.randomUUID();
        UUID requestCourseId = UUID.randomUUID();
        UpdateCourseRequest request = UpdateCourseRequest.builder()
                .courseID(requestCourseId)
                .courseName("Name")
                .duration(10)
                .quantity(1)
                .image("img")
                .description("desc")
                .ageGroup(AgeGroup.ADULT)
                .build();
        Course course = Course.builder()
                .courseID(methodCourseId)
                .courseName("Old")
                .duration(0)
                .quantity(0)
                .image("old")
                .description("old")
                .ageGroup(AgeGroup.ADULT)
                .build();
        CourseResponse response = CourseResponse.builder()
                .courseID(methodCourseId)
                .courseName("Name")
                .duration(0)
                .quantity(1)
                .image("img")
                .description("desc")
                .ageGroup(AgeGroup.ADULT)
                .build();

        when(courseRepository.findById(methodCourseId)).thenReturn(Optional.of(course));
        when(moduleService.getAllModulesByCourseID(methodCourseId, CourseStatus.AVAILABLE)).thenReturn(Collections.emptyList());
        when(courseRepository.save(any(Course.class))).thenReturn(course);
        when(courseMapper.toDto(any(Course.class))).thenReturn(response);

        CourseResponse result = courseService.updateCourse(methodCourseId, request);

        assertEquals(response, result);
        assertEquals("Name", course.getCourseName());
        assertEquals(1, course.getQuantity());
        assertEquals("img", course.getImage());
        assertEquals("desc", course.getDescription());
        assertEquals(AgeGroup.ADULT, course.getAgeGroup());
    }

    @Test
    void testGetAllCoursesReturnsAllCourseResponses() {
        Course course1 = Course.builder().courseID(UUID.randomUUID()).build();
        Course course2 = Course.builder().courseID(UUID.randomUUID()).build();
        List<Course> courses = Arrays.asList(course1, course2);
        CourseResponse resp1 = CourseResponse.builder().courseID(course1.getCourseID()).build();
        CourseResponse resp2 = CourseResponse.builder().courseID(course2.getCourseID()).build();

        when(courseRepository.findAll()).thenReturn(courses);
        when(courseMapper.toDto(course1)).thenReturn(resp1);
        when(courseMapper.toDto(course2)).thenReturn(resp2);

        List<CourseResponse> result = courseService.getAllCourses();

        assertEquals(2, result.size());
        assertTrue(result.contains(resp1));
        assertTrue(result.contains(resp2));
    }

    @Test
    void testUpdateCourseThrowsWhenCourseNotFound() {
        UUID courseId = UUID.randomUUID();
        UpdateCourseRequest request = UpdateCourseRequest.builder()
                .courseID(courseId)
                .courseName("Name")
                .duration(10)
                .quantity(1)
                .image("img")
                .description("desc")
                .ageGroup(AgeGroup.ADULT)
                .build();

        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> courseService.updateCourse(courseId, request));
    }

    @Test
    void testUpdateCourseStatusWithValidCourse() {
        UUID courseId = UUID.randomUUID();
        Course course = Course.builder().courseID(courseId).status(CourseStatus.PENDING).build();
        Course updatedCourse = Course.builder().courseID(courseId).status(CourseStatus.AVAILABLE).build();
        CourseResponse response = CourseResponse.builder().courseID(courseId).status(CourseStatus.AVAILABLE).build();

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenReturn(updatedCourse);
        when(courseMapper.toDto(any(Course.class))).thenReturn(response);

        CourseResponse result = courseService.updateCourseStatus(courseId, CourseStatus.AVAILABLE);

        assertEquals(response, result);
        assertEquals(CourseStatus.AVAILABLE, course.getStatus());
    }

    @Test
    void testGetCourseThrowsWhenCourseNotFound() {
        UUID courseId = UUID.randomUUID();
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> courseService.getCourse(courseId));
    }

    @Test
    void testGetCoursesByStatusAndDateDurationReturnsCorrectCourses() {
        CourseStatus status = CourseStatus.AVAILABLE;
        Instant start = Instant.now().minusSeconds(10000);
        Instant end = Instant.now();
        Course course = Course.builder().courseID(UUID.randomUUID()).status(status).build();
        List<Course> courses = Collections.singletonList(course);
        CourseResponse response = CourseResponse.builder().courseID(course.getCourseID()).status(status).build();

        when(courseRepository.findByStatusAndCreatedAtBetween(status, start, end)).thenReturn(courses);
        when(courseMapper.toDto(course)).thenReturn(response);

        List<CourseResponse> result = courseService.getCoursesByStatusAndDateDuration(status, start, end);

        assertEquals(1, result.size());
        assertEquals(response, result.get(0));
    }

    @Test
    void testGetCoursesByStatusAndDateDurationReturnsEmptyListWhenNoCourses() {
        CourseStatus status = CourseStatus.AVAILABLE;
        Instant start = Instant.now().minusSeconds(10000);
        Instant end = Instant.now();

        when(courseRepository.findByStatusAndCreatedAtBetween(status, start, end)).thenReturn(Collections.emptyList());

        List<CourseResponse> result = courseService.getCoursesByStatusAndDateDuration(status, start, end);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}