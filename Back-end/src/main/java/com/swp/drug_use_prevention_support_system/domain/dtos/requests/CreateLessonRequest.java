package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateLessonRequest {

    @NotBlank(message = "Lesson name ID is required")
    @Size(max = 255)
    String lessonName;

    @NotEmpty(message = "Objective is required")
    String objective;

    @NotEmpty(message = "Content is required")
    String content;

    @NotEmpty(message = "Resource is required")
    String resource;

    @NotNull(message = "Module ID is required")
    UUID moduleID;
}
