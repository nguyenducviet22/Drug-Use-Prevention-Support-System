package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.model.LessonContent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonResponse {

    @NotBlank
    String lessonID;

    @NotBlank
    String moduleID;

    @NotBlank
    String lessonName;

    @NotBlank
    String lessonTitle;

    @Min(1)
    int lessonDuration;

    @NotBlank
    AgeGroup lessonAgeGroup;

    @NotBlank
    String lessonLevel;

    @NotEmpty
    List<@NotBlank String> lessonObjectives;

    @NotEmpty
    List<@Valid LessonContent> lessonContent;

    @DecimalMin("0.0")
    @DecimalMax("100.0")
    Double lessonProgress;

    @NotNull
    LocalDateTime lessonCreatedAt;

    @NotNull
    LocalDateTime lessonUpdatedAt;
}