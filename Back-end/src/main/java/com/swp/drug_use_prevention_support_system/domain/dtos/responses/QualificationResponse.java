package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.Degree;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QualificationResponse {

    UUID qualificationID;
    String name;
    String image;
    Degree degree;
    String institution;
    Integer year;
    CourseStatus status;
    String createdAt;
    String updatedAt;
    UserResponse consultant;
}
