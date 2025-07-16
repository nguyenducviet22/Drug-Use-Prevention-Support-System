package com.swp.drug_use_prevention_support_system.domain.dtos.responses;


import com.swp.drug_use_prevention_support_system.domain.enums.EventUserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventStatusResponse {
    private EventUserStatus status;
    private boolean isFull;
}
