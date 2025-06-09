package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must be less than 256 characters")
    String email;

    @NotBlank(message = "Full name is required")
    @Size(max = 255, message = "Full name must be less than 256 characters")
    String fullName;

    @NotNull(message = "Date of birth is required")
    LocalDate dob;

    @NotNull(message = "Gender is required")
    Gender gender;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+0?1\\s)?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}$", message = "Invalid phone number format")
    String phoneNumber;

    @NotBlank(message = "Job is required")
    @Size(max = 255, message = "Job must be less than 256 characters")
    String job;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must be less than 256 characters")
    String address;
}
