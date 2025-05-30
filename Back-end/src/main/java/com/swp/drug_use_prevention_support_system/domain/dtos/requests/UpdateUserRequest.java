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

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must be less than 256 characters")
    String email;

    @Size(max = 255, message = "Full name must be less than 256 characters")
    String fullName;

    LocalDate dob;

    Gender gender;

    @Pattern(regexp = "^(\\+0?1\\s)?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}$", message = "Invalid phone number format")
    String phoneNumber;

    @Size(max = 255, message = "Job must be less than 256 characters")
    String job;
}
