package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportRequest {

    String filterType;
    String startDate;
    String endDate;
}
