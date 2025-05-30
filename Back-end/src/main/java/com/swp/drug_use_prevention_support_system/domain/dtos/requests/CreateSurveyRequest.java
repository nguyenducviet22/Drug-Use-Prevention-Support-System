package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.SurveyStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.SurveyType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateSurveyRequest {

    @NotNull(message = "Survey type is required")
    SurveyType type;

    @NotNull(message = "Survey status is required")
    SurveyStatus status;

    @Size(max = 5000, message = "Feedback must be less than 5000 characters")
    String feedback;

    @Size(max = 5000, message = "Description must be less than 5000 characters")
    String description;

    UUID eventId;
}
