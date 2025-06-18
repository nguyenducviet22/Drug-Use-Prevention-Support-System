package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ModuleResponse {

    @NotBlank
    String moduleID;

    @NotBlank
    String moduleName;
}
