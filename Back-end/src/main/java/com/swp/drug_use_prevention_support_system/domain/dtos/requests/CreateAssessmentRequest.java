package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAssessmentRequest {

    String img;

    @NotBlank(message = "Assessment type is required")
    String assessmentType;

    @NotBlank(message = "Link Test is required")
    String linkTest;
}
