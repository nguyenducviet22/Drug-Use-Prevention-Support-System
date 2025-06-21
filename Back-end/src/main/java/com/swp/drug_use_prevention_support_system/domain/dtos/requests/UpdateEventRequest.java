package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateEventRequest {

    @NotBlank(message = "Event name must not be blank")
    String eventName;

    String subTitle;

    @Positive(message = "Duration must be a positive number")
    Integer duration;

    @PositiveOrZero(message = "Quantity cannot be negative")
    Integer quantity;

    String description;

    String img;

    @NotNull(message = "Status is required")
    EventStatus status;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be today or in the future")
    LocalDateTime endDate;

    @NotNull(message = "Age group is required")
    AgeGroup ageGroup;

    @NotNull(message = "Location is required")
    String location;

    @PositiveOrZero(message = "Fee cannot be negative")
    @NotNull(message = "Fee is required")
    Double fee;

    @NotNull(message = "Event Details is required")
    String details;
}
