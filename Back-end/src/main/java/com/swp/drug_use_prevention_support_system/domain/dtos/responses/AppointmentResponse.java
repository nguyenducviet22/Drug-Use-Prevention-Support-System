package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentResponse {

    UUID appointmentID;
    String notes;
    AppointmentStatus status;
    LocalDateTime createdAt;
    LocalDateTime appointmentDateTime;
    User member;
    User consultant;
}
