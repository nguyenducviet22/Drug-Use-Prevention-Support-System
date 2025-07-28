package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserDetailsRequest {

    @NotBlank(message = "Full name is required")
    String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\d{3}-\\d{3}-\\d{4}|\\d{3}-\\d{4}-\\d{4})$",
            message = "Phone number must be in format xxx-xxx-xxxx or xxx-xxxx-xxxx"
    )
    String phoneNumber;

    @NotBlank(message = "Relationship is required")
    String relationship;

    @NotBlank(message = "Address is required")
    String address;
}
