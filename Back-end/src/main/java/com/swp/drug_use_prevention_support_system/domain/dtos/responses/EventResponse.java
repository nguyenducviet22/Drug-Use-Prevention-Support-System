package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventResponse {

    UUID eventID;
    String eventName;
    Integer duration;
    Integer quantity;
    String description;
    String img;
    EventStatus status;
    LocalDate startDate;
    LocalDate endDate;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
