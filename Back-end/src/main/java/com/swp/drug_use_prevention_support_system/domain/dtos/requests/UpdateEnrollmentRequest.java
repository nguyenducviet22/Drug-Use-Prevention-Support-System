package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
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
    LocalDateTime startDate;

    @FutureOrPresent(message = "End date must be today or in the future")
    LocalDateTime endDate;
}
