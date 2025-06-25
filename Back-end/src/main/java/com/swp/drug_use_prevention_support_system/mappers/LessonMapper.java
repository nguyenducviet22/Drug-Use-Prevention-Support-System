package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Lesson;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LessonMapper {

    Lesson toEntity(CreateLessonRequest request);
    Lesson toEntity(UpdateLessonRequest request);
    LessonResponse toDto(Lesson lesson);
}
