package com.swp.drug_use_prevention_support_system.mappers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateNotificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.NotificationResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    Notification toEntity(CreateNotificationRequest request);
    NotificationResponse toDto(Notification notification);
}
