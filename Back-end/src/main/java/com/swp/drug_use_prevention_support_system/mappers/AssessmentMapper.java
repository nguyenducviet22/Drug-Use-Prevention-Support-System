package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Assessment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AssessmentMapper {

    Assessment toEntity(CreateAssessmentRequest request);
    Assessment toEntity(UpdateAssessmentRequest request);
    Assessment toEntity(AssessmentResponse response);
    AssessmentResponse toDto(Assessment assessment);
}
