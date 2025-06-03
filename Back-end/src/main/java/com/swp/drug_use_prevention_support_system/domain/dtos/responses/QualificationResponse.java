package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.Degree;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QualificationResponse {

    UUID qualificationID;
    String img;
    Degree degree;
    String institution;
    Integer year;
    String description;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UserResponse consultant;
}
