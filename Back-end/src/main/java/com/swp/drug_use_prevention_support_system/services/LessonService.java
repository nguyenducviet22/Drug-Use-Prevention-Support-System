package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteLessonsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Lesson;
import com.swp.drug_use_prevention_support_system.domain.entities.Module;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.mappers.LessonMapper;
import com.swp.drug_use_prevention_support_system.repositories.LessonRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;
    private final ModuleService moduleService;
    private final BlogService blogService;

    public LessonResponse createLesson(CreateLessonRequest request) {
        Lesson lesson = lessonMapper.toEntity(request);
        lesson.setLessonID(UUID.randomUUID());
        lesson.setStatus(CourseStatus.AVAILABLE);
        lesson.setDuration(calculateDuration(request.getContent()));
        UUID moduleID = request.getModuleID();
        Module module = moduleService.getModelEntity(moduleID);
        lesson.setModule(module);
        lessonRepository.save(lesson);
        return lessonMapper.toDto(lesson);
    }

    public List<Lesson> getLessonsByModuleID(UUID moduleID, CourseStatus status) {
        return lessonRepository.findByModuleModuleIDAndStatus(moduleID, status);
    }

    public List<LessonResponse> getLessonsForModule(UUID moduleID) {
        List<Lesson> lessons = getLessonsByModuleID(moduleID, CourseStatus.AVAILABLE);
        return lessons.stream()
                .map(lesson -> lessonMapper.toDto(lesson))
                .toList();
    }

    public Lesson getLessonEntity(UUID lessonID) {
        return lessonRepository.findById(lessonID)
                .orElseThrow(() -> new EntityNotFoundException("Lesson does not exist with ID: " + lessonID));
    }

    public LessonResponse getLesson(UUID lessonID) {
        Lesson lesson = getLessonEntity(lessonID);
        return lessonMapper.toDto(lesson);
    }

    public LessonResponse updateLesson(UUID lessonID,
                                       UpdateLessonRequest request) {
        Lesson lesson = getLessonEntity(lessonID);
        lesson.setLessonName(request.getLessonName());
        lesson.setDuration(calculateDuration(request.getContent()));
        lesson.setObjective(request.getObjective());
        lesson.setContent(request.getContent());
        lessonRepository.save(lesson);
        return lessonMapper.toDto(lesson);
    }

    public List<LessonResponse> updateLessonsStatus(UUID moduleID, DeleteLessonsRequest request) {
        List<UUID> existingLessonIDs = getLessonsByModuleID(moduleID, CourseStatus.AVAILABLE).stream()
                .map(Lesson::getLessonID).toList();
        List<UUID> requestedLessonIDs = request.getLessonIds();
        List<Lesson> lessons = new ArrayList<>();
        for (UUID id : requestedLessonIDs) {
            if (existingLessonIDs.contains(id)) {
                Lesson lesson = getLessonEntity(id);
                lesson.setStatus(request.getStatus());
                lessonRepository.save(lesson);
                lessons.add(lesson);
            }
        }
        return lessons.stream().map(lesson -> lessonMapper.toDto(lesson)).toList();
    }

    public int countLessonsByCourseId(UUID courseID) {
        return lessonRepository.countLessonsByCourseId(courseID);
    }

    private int calculateDuration(String content){
        return blogService.calculateReadingTime(content);
    }
}
