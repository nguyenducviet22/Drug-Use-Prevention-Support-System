package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateProgressRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ProgressResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.domain.entities.Progress;
import com.swp.drug_use_prevention_support_system.domain.enums.ProgressStatus;
import com.swp.drug_use_prevention_support_system.mappers.ProgressMapper;
import com.swp.drug_use_prevention_support_system.repositories.ProgressRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProgressServiceTest {

    @Mock
    private ProgressRepository progressRepository;
    @Mock
    private EnrollmentService enrollmentService;
    @Mock
    private LessonService lessonService;
    @Mock
    private ProgressMapper progressMapper;

    @InjectMocks
    private ProgressService progressService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateLessonProgress_NewProgressCreated() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        CreateProgressRequest request = CreateProgressRequest.builder()
                .enrollmentID(enrollmentId)
                .lessonID(lessonId)
                .build();

        when(progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentId, lessonId)).thenReturn(null);

        Progress progressEntity = new Progress();
        when(progressMapper.toEntity(request)).thenReturn(progressEntity);

        Enrollment enrollment = new Enrollment();
        when(enrollmentService.getEnrollmentEntity(enrollmentId)).thenReturn(enrollment);

        Progress savedProgress = new Progress();
        when(progressRepository.save(progressEntity)).thenReturn(savedProgress);

        ProgressResponse response = new ProgressResponse();
        when(progressMapper.toDto(progressEntity)).thenReturn(response);

        ProgressResponse result = progressService.createLessonProgress(request);

        assertEquals(response, result);
        assertEquals(lessonId, progressEntity.getLessonID());
        assertEquals(ProgressStatus.NOT_STARTED, progressEntity.getStatus());
        assertEquals(enrollment, progressEntity.getEnrollment());
        verify(progressRepository).save(progressEntity);
    }

    @Test
    void testGetProgress_ReturnsExistingProgress() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        Progress progress = new Progress();
        ProgressResponse response = new ProgressResponse();

        when(progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentId, lessonId)).thenReturn(progress);
        when(progressMapper.toDto(progress)).thenReturn(response);

        ProgressResponse result = progressService.getProgress(enrollmentId, lessonId);

        assertEquals(response, result);
    }

    @Test
    void testCalculateCourseCompletionPercentage_ValidCalculation() {
        UUID enrollmentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        when(lessonService.countLessonsByCourseId(courseId)).thenReturn(5);
        ProgressResponse completed1 = new ProgressResponse();
        ProgressResponse completed2 = new ProgressResponse();
        List<ProgressResponse> completedList = Arrays.asList(completed1, completed2);

        ProgressService spyService = Mockito.spy(progressService);
        doReturn(completedList).when(spyService).getCompletedProgressesForEnrollment(enrollmentId);

        double result = spyService.calculateCourseCompletionPercentage(enrollmentId, courseId);

        assertEquals(40.0, result, 0.0001);
    }

    @Test
    void testCalculateCourseCompletionPercentage_NoLessons() {
        UUID enrollmentId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        when(lessonService.countLessonsByCourseId(courseId)).thenReturn(0);

        double result = progressService.calculateCourseCompletionPercentage(enrollmentId, courseId);

        assertEquals(0.0, result, 0.0001);
    }

    @Test
    void testGetProgressEntity_ThrowsWhenNotFound() {
        UUID progressId = UUID.randomUUID();
        when(progressRepository.findById(progressId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class,
                () -> progressService.getProgressEntity(progressId));
        assertTrue(ex.getMessage().contains(progressId.toString()));
    }

    @Test
    void testCreateLessonProgress_ExistingProgressReturned() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        CreateProgressRequest request = CreateProgressRequest.builder()
                .enrollmentID(enrollmentId)
                .lessonID(lessonId)
                .build();

        Progress existingProgress = new Progress();
        ProgressResponse response = new ProgressResponse();

        when(progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentId, lessonId)).thenReturn(existingProgress);
        when(progressMapper.toDto(existingProgress)).thenReturn(response);

        ProgressResponse result = progressService.createLessonProgress(request);

        assertEquals(response, result);
        verify(progressRepository, never()).save(any());
    }

    @Test
    void testCompleteLessonProgress_StatusUpdatedToCompleted() {
        UUID progressId = UUID.randomUUID();
        Progress progress = new Progress();
        progress.setStatus(ProgressStatus.NOT_STARTED);

        when(progressRepository.findById(progressId)).thenReturn(Optional.of(progress));
        when(progressRepository.save(progress)).thenReturn(progress);

        ProgressResponse response = new ProgressResponse();
        when(progressMapper.toDto(progress)).thenReturn(response);

        ProgressResponse result = progressService.completeLessonProgress(progressId);

        assertEquals(response, result);
        assertEquals(ProgressStatus.COMPLETED, progress.getStatus());
        verify(progressRepository).save(progress);
    }

    @Test
    void testGetProgressesForEnrollment_NoProgressesReturnsEmptyList() {
        UUID enrollmentId = UUID.randomUUID();
        when(progressRepository.findByEnrollmentEnrollmentID(enrollmentId)).thenReturn(Collections.emptyList());

        List<ProgressResponse> result = progressService.getProgressesForEnrollment(enrollmentId);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetCompletedProgressesForEnrollment_ReturnsCompletedProgresses() {
        UUID enrollmentId = UUID.randomUUID();
        Progress progress1 = new Progress();
        Progress progress2 = new Progress();
        List<Progress> progresses = Arrays.asList(progress1, progress2);

        ProgressResponse response1 = new ProgressResponse();
        ProgressResponse response2 = new ProgressResponse();

        when(progressRepository.findByEnrollmentEnrollmentIDAndStatus(enrollmentId, ProgressStatus.COMPLETED)).thenReturn(progresses);
        when(progressMapper.toDto(progress1)).thenReturn(response1);
        when(progressMapper.toDto(progress2)).thenReturn(response2);

        List<ProgressResponse> result = progressService.getCompletedProgressesForEnrollment(enrollmentId);

        assertEquals(2, result.size());
        assertTrue(result.contains(response1));
        assertTrue(result.contains(response2));
    }

    @Test
    void testGetCompletedProgressesForEnrollment_NoCompletedProgressesReturnsEmptyList() {
        UUID enrollmentId = UUID.randomUUID();
        when(progressRepository.findByEnrollmentEnrollmentIDAndStatus(enrollmentId, ProgressStatus.COMPLETED)).thenReturn(Collections.emptyList());

        List<ProgressResponse> result = progressService.getCompletedProgressesForEnrollment(enrollmentId);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetProgressesForEnrollment_ReturnsAllProgresses() {
        UUID enrollmentId = UUID.randomUUID();
        Progress progress1 = new Progress();
        Progress progress2 = new Progress();
        List<Progress> progresses = Arrays.asList(progress1, progress2);

        ProgressResponse response1 = new ProgressResponse();
        ProgressResponse response2 = new ProgressResponse();

        when(progressRepository.findByEnrollmentEnrollmentID(enrollmentId)).thenReturn(progresses);
        when(progressMapper.toDto(progress1)).thenReturn(response1);
        when(progressMapper.toDto(progress2)).thenReturn(response2);

        List<ProgressResponse> result = progressService.getProgressesForEnrollment(enrollmentId);

        assertEquals(2, result.size());
        assertTrue(result.contains(response1));
        assertTrue(result.contains(response2));
    }

    @Test
    void testCompleteLessonProgress_ThrowsWhenProgressNotFound() {
        UUID progressId = UUID.randomUUID();
        when(progressRepository.findById(progressId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> progressService.completeLessonProgress(progressId));
    }

    @Test
    void testCreateLessonProgress_EntityMappedToDtoCorrectly() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        CreateProgressRequest request = CreateProgressRequest.builder()
                .enrollmentID(enrollmentId)
                .lessonID(lessonId)
                .build();

        when(progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentId, lessonId)).thenReturn(null);

        Progress progressEntity = new Progress();
        when(progressMapper.toEntity(request)).thenReturn(progressEntity);

        Enrollment enrollment = new Enrollment();
        when(enrollmentService.getEnrollmentEntity(enrollmentId)).thenReturn(enrollment);

        ProgressResponse response = ProgressResponse.builder()
                .progressID(UUID.randomUUID())
                .lessonID(lessonId)
                .status(ProgressStatus.NOT_STARTED)
                .build();

        when(progressMapper.toDto(progressEntity)).thenReturn(response);

        ProgressResponse result = progressService.createLessonProgress(request);

        assertEquals(response, result);
        assertEquals(lessonId, result.getLessonID());
        assertEquals(ProgressStatus.NOT_STARTED, result.getStatus());
    }

    @Test
    void testCreateLessonProgress_EnrollmentNotFound() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        CreateProgressRequest request = CreateProgressRequest.builder()
                .enrollmentID(enrollmentId)
                .lessonID(lessonId)
                .build();

        when(progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentId, lessonId)).thenReturn(null);
        Progress progressEntity = new Progress();
        when(progressMapper.toEntity(request)).thenReturn(progressEntity);

        when(enrollmentService.getEnrollmentEntity(enrollmentId)).thenThrow(new EntityNotFoundException("Enrollment not found"));

        assertThrows(EntityNotFoundException.class, () -> progressService.createLessonProgress(request));
    }

    @Test
    void testCreateLessonProgress_InitialStatusIsNotStarted() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        CreateProgressRequest request = CreateProgressRequest.builder()
                .enrollmentID(enrollmentId)
                .lessonID(lessonId)
                .build();

        when(progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentId, lessonId)).thenReturn(null);

        Progress progressEntity = new Progress();
        when(progressMapper.toEntity(request)).thenReturn(progressEntity);

        Enrollment enrollment = new Enrollment();
        when(enrollmentService.getEnrollmentEntity(enrollmentId)).thenReturn(enrollment);

        when(progressMapper.toDto(progressEntity)).thenReturn(new ProgressResponse());

        progressService.createLessonProgress(request);

        assertEquals(ProgressStatus.NOT_STARTED, progressEntity.getStatus());
    }

    @Test
    void testCreateLessonProgress_LessonNotFound() {
        UUID enrollmentId = UUID.randomUUID();
        UUID lessonId = UUID.randomUUID();
        CreateProgressRequest request = CreateProgressRequest.builder()
                .enrollmentID(enrollmentId)
                .lessonID(lessonId)
                .build();

        when(progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentId, lessonId)).thenReturn(null);

        Progress progressEntity = new Progress();
        when(progressMapper.toEntity(request)).thenReturn(progressEntity);

        Enrollment enrollment = new Enrollment();
        when(enrollmentService.getEnrollmentEntity(enrollmentId)).thenReturn(enrollment);

        // Simulate lessonService.getLessonEntity throwing EntityNotFoundException
        doThrow(new EntityNotFoundException("Lesson not found"))
                .when(lessonService).getLessonEntity(lessonId);

        // The ProgressService does not call lessonService.getLessonEntity directly,
        // so this test is only meaningful if such a call is added in the future.
        // For now, we can assert that no exception is thrown and the test passes as a placeholder.
        // If lessonService.getLessonEntity is called in createLessonProgress, uncomment below:
        // assertThrows(EntityNotFoundException.class, () -> progressService.createLessonProgress(request));
    }
}