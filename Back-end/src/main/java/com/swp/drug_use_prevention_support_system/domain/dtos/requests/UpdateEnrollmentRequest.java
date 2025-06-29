package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateEnrollmentRequest {

    @NotNull(message = "Course ID must not be null")
    UUID courseId;

    @FutureOrPresent(message = "Start date must be today or in the future")
    LocalDate startDate;

    @FutureOrPresent(message = "End date must be today or in the future")
    LocalDate endDate;
}
