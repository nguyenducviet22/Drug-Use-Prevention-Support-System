package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAppointmentRequest {

    @NotBlank(message = "Appointment notes is required")
    String notes;

    @NotNull(message = "Appointment status is required")
    AppointmentStatus status;

    @NotNull(message = "Appointment date and time is required")
    String appointmentDateTime;
}
