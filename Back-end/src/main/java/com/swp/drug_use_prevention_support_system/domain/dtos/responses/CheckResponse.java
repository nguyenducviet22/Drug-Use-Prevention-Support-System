package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckResponse {
    boolean existed;
    double completion;
}
