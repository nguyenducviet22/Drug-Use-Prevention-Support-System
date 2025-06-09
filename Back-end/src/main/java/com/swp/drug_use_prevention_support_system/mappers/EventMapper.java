package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Event;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EventMapper {

    Event toEntity(CreateEventRequest request);
    Event toEntity(UpdateEventRequest request);
    Event toEntity(EventResponse response);
    EventResponse toDto(Event event);
}
