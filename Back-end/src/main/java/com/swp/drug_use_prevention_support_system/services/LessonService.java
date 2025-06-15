package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.model.Lesson;
import com.swp.drug_use_prevention_support_system.mappers.LessonMapper;
import com.swp.drug_use_prevention_support_system.repositories.LessonRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public List<LessonResponse> getAllLessonsByModuleID(String moduleID) {
        List<Lesson> lessons = lessonRepository.findAllByModuleID(moduleID);
        return lessons.stream()
                .map(lesson -> lessonMapper.toDto(lesson))
                .toList();
    }

    public Lesson getLessonModel(String lessonID) {
        return lessonRepository.findById(lessonID)
                .orElseThrow(() -> new EntityNotFoundException("Lesson does not exist with ID: " + lessonID));
    }

    public LessonResponse getLesson(String lessonID) {
        Lesson lesson = getLessonModel(lessonID);
        return lessonMapper.toDto(lesson);
    }

    public LessonResponse updateLesson(String lessonID,
                                       UpdateLessonRequest request) {
        Lesson lesson = getLessonModel(lessonID);
        lesson.setLessonName(request.getLessonName());
        lesson.setLessonTitle(request.getLessonTitle());
        lesson.setLessonDuration(request.getLessonDuration());
        lesson.setLessonAgeGroup(request.getLessonAgeGroup());
        lesson.setLessonLevel(request.getLessonLevel());
        lesson.setLessonObjectives(request.getLessonObjectives());
        lesson.setLessonContent(request.getLessonContent());
        lesson.setLessonProgress(request.getLessonProgress());
        lessonRepository.save(lesson);
        return lessonMapper.toDto(lesson);
    }
}
