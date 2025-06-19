package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateLessonRequest {

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
}