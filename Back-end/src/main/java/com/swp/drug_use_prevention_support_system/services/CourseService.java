package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CourseResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Course;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.CourseMapper;
import com.swp.drug_use_prevention_support_system.repositories.CourseRepository;
import com.swp.drug_use_prevention_support_system.repositories.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final EnrollmentRepository enrollmentRepository;

    @PreAuthorize("hasRole('STAFF')")
    public CourseResponse createCourse(CreateCourseRequest request) {
        Course course = courseMapper.toEntity(request);
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
        course.setDuration(request.getDuration());
        course.setQuantity(request.getQuantity());
        course.setImg(request.getImg());
        course.setDescription(request.getDescription());
        course.setAgeGroup(request.getAgeGroup());
        course.setStatus(request.getStatus());
        courseRepository.save(course);
        return courseMapper.toDto(course);
    }

    @PreAuthorize("hasRole('STAFF')")
    public CourseResponse updateCourseStatus(UUID courseId, CourseStatus status) {
        Course course = getCourseEntity(courseId);
        course.setStatus(status);
        courseRepository.save(course);
        return courseMapper.toDto(course);
    }

    public List<CourseResponse> getCoursesByAgeGroup(AgeGroup ageGroup) {
        List<Course> courses = courseRepository.findCoursesByAgeGroup(ageGroup);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public List<CourseResponse> getTop3MostEnrolledCourses() {
        Pageable top3 = PageRequest.of(0, 3);
        List<Course> courses = enrollmentRepository.findTop3MostEnrolledCourses(top3);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }

    public List<CourseResponse> getCoursesByStatus(EnrollmentStatus status, String username) {
        List<Course> courses = enrollmentRepository.findEnrolledCoursesByStatusAndMember(status, username);
        return courses.stream()
                .map(course -> courseMapper.toDto(course))
                .toList();
    }
}
