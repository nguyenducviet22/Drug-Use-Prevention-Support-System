package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Module;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ModuleMapper {

    Module toModel(CreateModuleRequest request);
    ModuleResponse toDto(Module module);
}
