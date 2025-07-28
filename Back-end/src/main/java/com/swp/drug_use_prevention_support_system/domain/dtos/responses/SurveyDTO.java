package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.SurveyType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class SurveyDTO {
    private UUID surveyID;
    private UUID eventID;
    private String formLink;
    private SurveyType type;
}
