package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AvailabilityResponse {

    UUID availabilityID;
    AppointmentStatus status;
    List<Instant> appointmentDateTime;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UserResponse consultant;
}
