package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.SurveyType;
import lombok.Data;

import java.util.UUID;

@Data
public class SurveyCreateRequest {
    private String formLink;
    private SurveyType type;
    private UUID eventID;
}