package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseResponse {

    UUID courseID;
    String courseName;
    Integer quantity;
    Integer duration;
    String img;
    String description;
    AgeGroup ageGroup;
    CourseStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
