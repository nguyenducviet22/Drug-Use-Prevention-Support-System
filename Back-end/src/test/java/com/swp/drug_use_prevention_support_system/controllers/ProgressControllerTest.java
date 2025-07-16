package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateProgressRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CheckResponse; // Assuming CheckResponse is defined elsewhere
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EnrollmentResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ProgressResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.ProgressStatus;
import com.swp.drug_use_prevention_support_system.services.EnrollmentService;
import com.swp.drug_use_prevention_support_system.services.ProgressService;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProgressControllerTest {

    @Mock
    private ProgressService progressService;

    @Mock
    private EnrollmentService enrollmentService;

    @InjectMocks
    private ProgressController progressController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createProgress tests ---
    @Test
    void testCreateProgress_Success() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        CreateProgressRequest request = CreateProgressRequest.builder()
                .enrollmentID(enrollmentId)
                .lessonID(lessonId)
                .build();
        EnrollmentResponse mockEnrollment = EnrollmentResponse.builder()
                .enrollmentID(enrollmentId)
                .build();
        ProgressResponse mockResponse = ProgressResponse.builder()
                .progressID(UUID.randomUUID())
                .enrollment(mockEnrollment)
                .lessonID(lessonId)
                .status(ProgressStatus.NOT_STARTED)
                .build();
        when(progressService.createLessonProgress(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<ProgressResponse>> responseEntity = progressController.createProgress(request);

        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(enrollmentId, responseEntity.getBody().getData().getEnrollment().getEnrollmentID());
        assertEquals(lessonId, responseEntity.getBody().getData().getLessonID());
        assertEquals(HttpStatus.CREATED.value(), responseEntity.getBody().getStatus());
        verify(progressService).createLessonProgress(request);
    }

    @Test
    void testCreateProgress_InvalidInput() {
        // Test with null enrollmentID
        CreateProgressRequest invalidRequest = CreateProgressRequest.builder()
                .enrollmentID(null)
                .lessonID(UUID.randomUUID())
                .build();

        // Simulate validation error from service layer or controller's @Valid
        when(progressService.createLessonProgress(invalidRequest))
                .thenThrow(new ConstraintViolationException("Enrollment ID must not be null", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> progressController.createProgress(invalidRequest));
        verify(progressService).createLessonProgress(invalidRequest);

        // Test with null lessonID
        CreateProgressRequest invalidRequest2 = CreateProgressRequest.builder()
                .enrollmentID(UUID.randomUUID())
                .lessonID(null)
                .build();
        when(progressService.createLessonProgress(invalidRequest2))
                .thenThrow(new ConstraintViolationException("Lesson ID must not be null", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> progressController.createProgress(invalidRequest2));
        verify(progressService, times(2)).createLessonProgress(any(CreateProgressRequest.class)); // Called twice
    }

    // --- 2. getProgressesForEnrollment tests ---
    @Test
    void testGetProgressesForEnrollment_Success() {
        UUID enrollmentId = UUID.randomUUID();
        EnrollmentResponse enrollment = enrollmentService.getEnrollment(enrollmentId);
        List<ProgressResponse> mockList = Arrays.asList(
                ProgressResponse.builder().progressID(UUID.randomUUID()).enrollment(enrollment).status(ProgressStatus.NOT_STARTED).build(),
                ProgressResponse.builder().progressID(UUID.randomUUID()).enrollment(enrollment).status(ProgressStatus.COMPLETED).build()
        );
        when(progressService.getProgressesForEnrollment(enrollmentId)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<ProgressResponse>>> responseEntity = progressController.getProgressesForEnrollment(enrollmentId);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(2, responseEntity.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(progressService).getProgressesForEnrollment(enrollmentId);
    }

    @Test
    void testGetProgressesForEnrollment_NoProgressFound() {
        UUID enrollmentId = UUID.randomUUID();
        when(progressService.getProgressesForEnrollment(enrollmentId)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<ProgressResponse>>> responseEntity = progressController.getProgressesForEnrollment(enrollmentId);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(progressService).getProgressesForEnrollment(enrollmentId);
    }

    // --- 3. completeLessonProgress tests ---
    @Test
    void testCompleteLessonProgress_Success() {
        UUID progressId = UUID.randomUUID();
        ProgressResponse mockResponse = ProgressResponse.builder()
                .progressID(progressId)
                .status(ProgressStatus.COMPLETED)
                .completedAt("2024-07-16T09:00:00Z")
                .build();
        when(progressService.completeLessonProgress(progressId)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<ProgressResponse>> responseEntity = progressController.completeLessonProgress(progressId);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(ProgressStatus.COMPLETED, responseEntity.getBody().getData().getStatus());
        verify(progressService).completeLessonProgress(progressId);
    }

    @Test
    void testCompleteLessonProgress_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(progressService.completeLessonProgress(nonExistentId)).thenThrow(new NoSuchElementException("Progress not found by ID"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> progressController.completeLessonProgress(nonExistentId));
        assertTrue(exception.getMessage().contains("Progress not found by ID"));
        verify(progressService).completeLessonProgress(nonExistentId);
    }

    // --- 4. getCourseCompletionPercentage tests ---
    @Test
    void testGetCourseCompletionPercentage_Success() {
        UUID enrollmentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        double expectedPercentage = 75.0;
        when(progressService.calculateCourseCompletionPercentage(enrollmentId, courseId)).thenReturn(expectedPercentage);

        ResponseEntity<ApiResponse<CheckResponse>> responseEntity = progressController.getCourseCompletionPercentage(enrollmentId, courseId);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(expectedPercentage, responseEntity.getBody().getData().getCompletion());
        verify(progressService).calculateCourseCompletionPercentage(enrollmentId, courseId);
    }

    @Test
    void testGetCourseCompletionPercentage_InvalidIdsOrNoEnrollment() {
        UUID enrollmentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        when(progressService.calculateCourseCompletionPercentage(enrollmentId, courseId))
                .thenThrow(new NoSuchElementException("Enrollment or Course not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> progressController.getCourseCompletionPercentage(enrollmentId, courseId));
        assertTrue(exception.getMessage().contains("Enrollment or Course not found"));
        verify(progressService).calculateCourseCompletionPercentage(enrollmentId, courseId);
    }

    // --- 5. getProgress (by enrollmentID and lessonID) tests ---
    @Test
    void testGetProgressByEnrollmentAndLessonId_Success() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        EnrollmentResponse mockEnrollment = EnrollmentResponse.builder()
                .enrollmentID(enrollmentId)
                .build();
        ProgressResponse mockResponse = ProgressResponse.builder()
                .progressID(UUID.randomUUID())
                .enrollment(mockEnrollment)
                .lessonID(lessonId)
                .status(ProgressStatus.NOT_STARTED)
                .build();
        when(progressService.getProgress(enrollmentId, lessonId)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<ProgressResponse>> responseEntity = progressController.getProgress(enrollmentId, lessonId);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(enrollmentId, responseEntity.getBody().getData().getEnrollment().getEnrollmentID());
        assertEquals(lessonId, responseEntity.getBody().getData().getLessonID());
        verify(progressService).getProgress(enrollmentId, lessonId);
    }

    @Test
    void testGetProgressByEnrollmentAndLessonId_NotFound() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        when(progressService.getProgress(enrollmentId, lessonId)).thenThrow(new NoSuchElementException("Progress not found for given enrollment and lesson"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> progressController.getProgress(enrollmentId, lessonId));
        assertTrue(exception.getMessage().contains("Progress not found for given enrollment and lesson"));
        verify(progressService).getProgress(enrollmentId, lessonId);
    }
}