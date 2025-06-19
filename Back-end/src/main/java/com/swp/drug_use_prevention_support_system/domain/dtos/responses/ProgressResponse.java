package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.ProgressStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProgressResponse {

    UUID progressID;
    UUID lessonID;
    ProgressStatus status;
    LocalDateTime completedAt;
    LocalDateTime lastAccessedAt;
    EnrollmentResponse enrollment;
}
