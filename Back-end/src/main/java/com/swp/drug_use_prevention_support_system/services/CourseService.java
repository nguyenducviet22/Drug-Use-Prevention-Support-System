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
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final EnrollmentRepository enrollmentRepository;
    private final ModuleService moduleService;
    private final LessonService lessonService;

    @PreAuthorize("hasRole('STAFF')")
    public CourseResponse createCourse(CreateCourseRequest request) {
        Course course = courseMapper.toEntity(request);
        course.setCourseID(UUID.randomUUID());
        course.setStatus(CourseStatus.PENDING);
        course.setDuration(0);
        courseRepository.save(course);
        return courseMapper.toDto(course);
    }

    public List<CourseResponse> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public Course getCourseEntity(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course does not exist with ID: " + courseId));
    }

    public CourseResponse getCourse(UUID courseId) {
        Course course = getCourseEntity(courseId);
        return courseMapper.toDto(course);
    }

    @PreAuthorize("hasRole('STAFF')")
    public CourseResponse updateCourse(UUID courseId, UpdateCourseRequest request) {
        Course course = getCourseEntity(courseId);
        course.setCourseName(request.getCourseName());
        course.setDuration(calculateCourseDuration(request.getCourseID()));
        course.setQuantity(request.getQuantity());
        course.setImage(request.getImage());
        course.setDescription(request.getDescription());
        course.setAgeGroup(request.getAgeGroup());
        courseRepository.save(course);
        return courseMapper.toDto(course);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public CourseResponse updateCourseStatus(UUID courseId, CourseStatus status) {
        Course course = getCourseEntity(courseId);
        course.setStatus(status);
        courseRepository.save(course);
        return courseMapper.toDto(course);
    }

    public List<CourseResponse> getCoursesByAgeGroup(AgeGroup ageGroup) {
        List<Course> courses = courseRepository.findByAgeGroupAndStatusOrderByCreatedAtDesc(ageGroup, CourseStatus.AVAILABLE);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public List<CourseResponse> getCoursesForMemberByStatus(EnrollmentStatus status, String username) {
        List<Course> courses = enrollmentRepository.findEnrolledCoursesByStatusAndMember(status, username);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public List<CourseResponse> getCoursesByStatus(CourseStatus status) {
        List<Course> courses = courseRepository.findByStatusOrderByCreatedAtDesc(status);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public List<CourseResponse> getCoursesByStatusAndDateDuration(CourseStatus status, Instant startedAt, Instant endedAt) {
        List<Course> courses = courseRepository.findByStatusAndCreatedAtBetween(status, startedAt, endedAt);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public List<CourseResponse> getAllCoursesByDateDuration( Instant startedAt,  Instant endedAt) {
        List<Course> courses = courseRepository.findByCreatedAtBetween(startedAt, endedAt);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public Integer calculateCourseDuration(UUID courseID) {
        List<com.swp.drug_use_prevention_support_system.domain.entities.Module> modules = moduleService.getAllModulesByCourseID(courseID, CourseStatus.AVAILABLE);

        int totalDuration = 0;

        for (Module module : modules) {
            List<Lesson> lessons = lessonService.getLessonsByModuleID(module.getModuleID(), CourseStatus.AVAILABLE);
            for (Lesson lesson : lessons) {
                totalDuration += lesson.getDuration();
            }
        }
        return totalDuration;
    }

    //ADMIN HOMEPAGE
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getCourseStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalCourses = courseRepository.count();
        long activeCourses = courseRepository.countByStatus(CourseStatus.AVAILABLE);

        YearMonth current = YearMonth.now();
        YearMonth last = current.minusMonths(1);

        int thisMonthCourses = courseRepository.countCoursesByMonth(current.getYear(), current.getMonthValue());
        int lastMonthCourses = courseRepository.countCoursesByMonth(last.getYear(), last.getMonthValue());

        int growth = thisMonthCourses - lastMonthCourses;
        double growthPercent = lastMonthCourses > 0 ? (double) growth / lastMonthCourses * 100 : 0;

        stats.put("totalCourses", totalCourses);
        stats.put("activeCourses", activeCourses);
        stats.put("growthPercent", Math.round(growthPercent));

        return stats;
    }
}
