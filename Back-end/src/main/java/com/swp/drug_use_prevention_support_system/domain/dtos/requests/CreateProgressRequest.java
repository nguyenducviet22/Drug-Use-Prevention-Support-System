package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateProgressRequest {

    @NotNull(message = "Enrollment ID must not be null")
    UUID enrollmentID;

    @NotNull(message = "Lesson ID must not be null")
    UUID lessonID;
}
