package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAppointmentRequest {

    String notes;

    @NotNull(message = "Appointment date and time is required")
    @FutureOrPresent(message = "Appointment date must be today or in the future")
    String appointmentDateTime;

    @NotBlank(message = "Consultant ID (username) is required")
    String consultantID;
}
