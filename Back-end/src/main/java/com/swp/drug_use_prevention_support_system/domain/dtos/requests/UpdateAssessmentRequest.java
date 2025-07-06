package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateAssessmentRequest {

    String image;

    @NotBlank(message = "Assessment type is required")
    AssessmentType assessmentType;

    @NotBlank(message = "Link Test is required")
    String linkTest;

    @NotBlank(message = "Description is required")
    String description;

    String details;
}
