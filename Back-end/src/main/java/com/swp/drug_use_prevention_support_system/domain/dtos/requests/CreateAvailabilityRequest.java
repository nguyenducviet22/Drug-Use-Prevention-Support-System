package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAvailabilityRequest {

    @NotNull(message = "Availability date and time is required")
    @Valid
    List<@NotBlank String> availabilityDateTimes;
}
