package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.model.LessonContent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateLessonRequest {

    @NotBlank
    @Size(max = 255)
    String lessonName;

    @NotBlank
    @Size(max = 255)
    String lessonTitle;

    @Min(value = 1, message = "Lesson duration must be at least 1 minute")
    int lessonDuration;

    @NotBlank
    AgeGroup lessonAgeGroup;

    @NotBlank
    String lessonLevel;

    @NotEmpty
    List<@NotBlank String> lessonObjectives;

    @NotEmpty
    List<@Valid LessonContent> lessonContent;

    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "100.0", inclusive = true)
    Double lessonProgress;
}