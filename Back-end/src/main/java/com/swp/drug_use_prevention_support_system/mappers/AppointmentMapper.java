package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AppointmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    Appointment toEntity(CreateAppointmentRequest request);
    Appointment toEntity(UpdateAppointmentRequest request);
    Appointment toEntity(AppointmentResponse response);
    AppointmentResponse toDto(Appointment appointment);
}
