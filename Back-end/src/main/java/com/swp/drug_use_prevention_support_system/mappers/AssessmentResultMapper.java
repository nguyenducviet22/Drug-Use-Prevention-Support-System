package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentResultRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResultResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Assessment;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AssessmentResultMapper {

    AssessmentResult toEntity(CreateAssessmentResultRequest request);
    AssessmentResult toEntity(AssessmentResultResponse response);
    AssessmentResultResponse toDto(AssessmentResult result);
}
