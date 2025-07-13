package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.SurveyStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.SurveyType;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SurveyResponse {

    UUID surveyID;
    SurveyType type;
    SurveyStatus status;
    String feedback;
    String description;
    String surveyDate;
    EventResponse event;
}
