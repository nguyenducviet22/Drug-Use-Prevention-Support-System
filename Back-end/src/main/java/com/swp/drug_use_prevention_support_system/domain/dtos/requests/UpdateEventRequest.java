package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateEventRequest {

    @NotBlank(message = "Event name must not be blank")
    String eventName;

    @Positive(message = "Duration must be a positive number")
    Integer duration;

    @PositiveOrZero(message = "Quantity cannot be negative")
    Integer quantity;

    String description;

    String img;

    @NotNull(message = "Status is required")
    EventStatus status;

    @NotNull(message = "Age group is required")
    AgeGroup ageGroup;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    LocalDate startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be today or in the future")
    LocalDate endDate;
}
