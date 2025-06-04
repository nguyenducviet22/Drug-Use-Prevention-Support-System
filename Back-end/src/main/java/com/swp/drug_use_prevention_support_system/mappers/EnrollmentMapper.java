package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EnrollmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {

    Enrollment toEntity(CreateEnrollmentRequest request);
    Enrollment toEntity(UpdateEnrollmentRequest request);
    Enrollment toEntity(EnrollmentResponse response);
    EnrollmentResponse toDto(Enrollment enrollment);
}
