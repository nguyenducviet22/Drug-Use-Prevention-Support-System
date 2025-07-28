package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.SurveyType;
import lombok.Data;

@Data
public class SurveyUpdateRequest {
    private String formLink;
    private SurveyType type;
}
