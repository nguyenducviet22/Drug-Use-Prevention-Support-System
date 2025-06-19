package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateProgressRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.*;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.domain.entities.Progress;
import com.swp.drug_use_prevention_support_system.domain.enums.ProgressStatus;
import com.swp.drug_use_prevention_support_system.mappers.ProgressMapper;
import com.swp.drug_use_prevention_support_system.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final EnrollmentService enrollmentService;
    private final LessonService lessonService;
    private final ProgressMapper progressMapper;

    public ProgressResponse getProgress(UUID enrollmentID, UUID lessonID) {
        Progress progress = progressRepository.findByEnrollmentEnrollmentIDAndLessonID(enrollmentID, lessonID);
        return progressMapper.toDto(progress);
    }

    public ProgressResponse createLessonProgress(CreateProgressRequest request) {
        Progress progress = progressMapper.toEntity(request);
        progress.setLessonID(request.getLessonID());
        progress.setStatus(ProgressStatus.NOT_STARTED);
        Enrollment enrollment = enrollmentService.getEnrollmentEntity(request.getEnrollmentID());
        progress.setEnrollment(enrollment);

        progressRepository.save(progress);
        return progressMapper.toDto(progress);
    }

    public List<ProgressResponse> getProgressesForEnrollment(UUID enrollmentID) {
        List<Progress> progresses = progressRepository.findByEnrollmentEnrollmentID(enrollmentID);
        return progresses.stream()
                .map(progress -> progressMapper.toDto(progress))
                .toList();
    }

    public List<ProgressResponse> getCompletedProgressesForEnrollment(UUID enrollmentID) {
        List<Progress> progresses = progressRepository.findByEnrollmentEnrollmentIDAndStatus(enrollmentID, ProgressStatus.COMPLETED);
        return progresses.stream()
                .map(progress -> progressMapper.toDto(progress))
                .toList();
    }

    public Progress getProgressEntity(UUID progressID) {
        return progressRepository.findById(progressID)
                .orElseThrow(() -> new EntityNotFoundException("Progress does not exist with ID: " + progressID));
    }

    public ProgressResponse completeLessonProgress(UUID progressID) {
        Progress existingProgress = getProgressEntity(progressID);
        existingProgress.setStatus(ProgressStatus.COMPLETED);
        progressRepository.save(existingProgress);
        return progressMapper.toDto(existingProgress);
    }

    public double calculateCourseCompletionPercentage(UUID enrollmentID, UUID courseID) {
        long totalLessonsInCourse = lessonService.countLessonsByCourseId(courseID);
        if (totalLessonsInCourse == 0) return 0.0;
        long completedLessons = getCompletedProgressesForEnrollment(enrollmentID).size();

        return (double) completedLessons / totalLessonsInCourse * 100.0;
    }

}
