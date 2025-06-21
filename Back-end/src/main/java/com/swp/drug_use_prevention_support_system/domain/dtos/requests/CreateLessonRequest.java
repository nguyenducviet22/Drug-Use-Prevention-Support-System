package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateLessonRequest {

    @NotBlank(message = "Lesson ID is required")
    UUID lessonID;

    @NotBlank(message = "Lesson name ID is required")
    @Size(max = 255)
    String lessonName;

    @Min(value = 1, message = "Lesson duration must be at least 1 minute")
    int duration;

    @NotEmpty(message = "Objective is required")
    String objective;

    @NotEmpty(message = "Content is required")
    String content;

    @NotEmpty(message = "Resource is required")
    String resource;

    @NotBlank(message = "Module ID is required")
    UUID moduleID;
}
