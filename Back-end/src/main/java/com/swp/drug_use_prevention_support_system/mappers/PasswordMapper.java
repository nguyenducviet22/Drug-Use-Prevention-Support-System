package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ForgotPasswordResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Password;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PasswordMapper {

    ForgotPasswordResponse toDto(Password password);
}
