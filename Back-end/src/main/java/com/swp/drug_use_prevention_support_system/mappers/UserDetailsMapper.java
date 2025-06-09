package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserDetailsResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.UserDetails;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserDetailsMapper {

    UserDetails toEntity(CreateUserDetailsRequest request);
    UserDetails toEntity(UpdateUserDetailsRequest request);
    UserDetails toEntity(UserDetailsResponse response);
    UserDetailsResponse toDto(UserDetails userDetails);
}
