package com.swp.drug_use_prevention_support_system.domain.entities;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventUserId implements Serializable {
    private UUID eventId;
    private String memberId;
}
