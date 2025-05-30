package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateSurveyRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateSurveyRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.SurveyResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Survey;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SurveyMapper {

    Survey toEntity(CreateSurveyRequest request);
    Survey toEntity(UpdateSurveyRequest request);
    SurveyResponse toDto(Survey survey);
}
