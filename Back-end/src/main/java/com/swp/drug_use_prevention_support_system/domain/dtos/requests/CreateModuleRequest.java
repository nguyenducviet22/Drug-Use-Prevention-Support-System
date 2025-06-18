package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateModuleRequest {

    @NotBlank(message = "Module name must not be blank")
    @Size(max = 255, message = "Module name must be at most 255 characters")
    String moduleName;
}
