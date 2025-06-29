package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AvailabilityResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Availability;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AvailabilityMapper {

    Availability toEntity(CreateAvailabilityRequest request);
    Availability toEntity(UpdateAvailabilityRequest request);
    Availability toEntity(AvailabilityResponse response);
    AvailabilityResponse toDto(Availability availability);
}
