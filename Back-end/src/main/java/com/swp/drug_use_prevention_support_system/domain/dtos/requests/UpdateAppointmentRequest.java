package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAppointmentRequest {

    String notes;

    @NotNull(message = "Appointment status is required")
    AppointmentStatus status;

    @NotNull(message = "Appointment date and time is required")
    LocalDateTime appointmentDateTime;

    @NotBlank(message = "Consultant ID (username) is required")
    String consultantID;
}
