package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnrollmentResponse {

    UUID enrollmentID;
    EnrollmentStatus status;
    LocalDate startDate;
    LocalDate endDate;
    CourseResponse course;
    UserResponse member;
}
