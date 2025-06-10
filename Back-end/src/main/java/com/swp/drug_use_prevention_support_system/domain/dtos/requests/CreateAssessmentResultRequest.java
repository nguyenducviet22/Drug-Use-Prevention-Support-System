package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAssessmentResultRequest {

    @NotNull(message = "Risk level is required")
    RiskLevel riskLevel;

    @NotNull(message = "Score is required")
    Integer score;

    @NotBlank(message = "Suggested Action is required")
    String suggestedAction;

    @NotBlank(message = "Completed Time is required")
    LocalDateTime completedTime;
}
