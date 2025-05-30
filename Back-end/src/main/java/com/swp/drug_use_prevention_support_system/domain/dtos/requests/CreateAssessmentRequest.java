package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAssessmentRequest {

    String img;

    @NotNull(message = "Risk level is required")
    RiskLevel riskLevel;

    @NotNull(message = "Score is required")
    Integer score;

    @NotBlank(message = "Assessment type is required")
    String assessmentType;

    String suggestedAction;
}
