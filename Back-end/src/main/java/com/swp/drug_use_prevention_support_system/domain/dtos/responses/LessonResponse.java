package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonResponse {

    UUID lessonID;
    String lessonName;
    int duration;
    String objective;
    String content;
    String resource;
    CourseStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    ModuleResponse module;
}