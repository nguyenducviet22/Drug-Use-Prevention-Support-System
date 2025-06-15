package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.model.LessonContent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateLessonRequest {

    @NotBlank(message = "Module ID is required")
    String moduleID;

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
}
