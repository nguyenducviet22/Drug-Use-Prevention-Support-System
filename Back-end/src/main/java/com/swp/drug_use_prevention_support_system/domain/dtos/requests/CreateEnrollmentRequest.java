package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateEnrollmentRequest {

    @NotNull(message = "Member username must not be null")
    @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    String username;

    @NotNull(message = "Course ID must not be null")
    UUID courseId;

    @FutureOrPresent(message = "Start date must be today or in the future")
    LocalDateTime startDate;

    @FutureOrPresent(message = "End date must be today or in the future")
    LocalDateTime endDate;

    @NotNull(message = "Status must not be null")
    EnrollmentStatus status;
}
