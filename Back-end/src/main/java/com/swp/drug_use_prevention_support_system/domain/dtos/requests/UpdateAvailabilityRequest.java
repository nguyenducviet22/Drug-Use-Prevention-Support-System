package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAvailabilityRequest {

    @NotNull(message = "Availability status is required")
    AppointmentStatus status;

    @NotNull(message = "Availability date and time is required")
    @Valid
    List<@NotNull @FutureOrPresent(message = "Availability date must be today or in the future") Instant> availabilityDateTimes;
}
