package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.Degree;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateQualificationRequest {

    @NotBlank(message = "Name is required")
    String name;

    @NotBlank(message = "Image URL is required")
    String img;

    @NotNull(message = "Degree is required")
    Degree degree;

    @NotBlank(message = "Institution is required")
    String institution;

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be valid")
    Integer year;
}
