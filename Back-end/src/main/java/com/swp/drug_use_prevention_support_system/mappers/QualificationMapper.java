package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.QualificationResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Qualification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QualificationMapper {

    Qualification toEntity(CreateQualificationRequest request);
    Qualification toEntity(UpdateQualificationRequest request);
    Qualification toEntity(QualificationResponse response);
    QualificationResponse toDto(Qualification qualification);
}
