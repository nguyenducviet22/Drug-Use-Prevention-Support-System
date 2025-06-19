package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateProgressRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ProgressResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Progress;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProgressMapper {

    Progress toEntity(CreateProgressRequest request);
    ProgressResponse toDto(Progress progress);
}
