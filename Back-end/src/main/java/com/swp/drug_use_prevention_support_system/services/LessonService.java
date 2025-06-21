package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Lesson;
import com.swp.drug_use_prevention_support_system.mappers.LessonMapper;
import com.swp.drug_use_prevention_support_system.repositories.LessonRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonMapper lessonMapper;

    public LessonResponse createLesson(CreateLessonRequest request) {
        Lesson lesson = lessonMapper.toModel(request);
        lessonRepository.save(lesson);
        return lessonMapper.toDto(lesson);
    }

    public List<LessonResponse> getLessonsByModuleID(UUID moduleID) {
        List<Lesson> lessons = lessonRepository.findByModuleModuleID(moduleID);
        return lessons.stream()
                .map(lesson -> lessonMapper.toDto(lesson))
                .toList();
    }

    public Lesson getLessonModel(UUID lessonID) {
        return lessonRepository.findById(lessonID)
                .orElseThrow(() -> new EntityNotFoundException("Lesson does not exist with ID: " + lessonID));
    }

    public LessonResponse getLesson(UUID lessonID) {
        Lesson lesson = getLessonModel(lessonID);
        return lessonMapper.toDto(lesson);
    }

    public LessonResponse updateLesson(UUID lessonID,
                                       UpdateLessonRequest request) {
        Lesson lesson = getLessonModel(lessonID);
        lesson.setLessonName(request.getLessonName());
        lesson.setDuration(request.getDuration());
        lesson.setObjective(request.getObjective());
        lesson.setContent(request.getContent());
        lessonRepository.save(lesson);
        return lessonMapper.toDto(lesson);
    }

    public int countLessonsByCourseId(UUID courseID) {
        return lessonRepository.countLessonsByCourseId(courseID);
    }
}
