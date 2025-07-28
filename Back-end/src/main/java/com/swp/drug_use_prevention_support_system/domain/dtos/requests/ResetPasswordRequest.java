package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {

    @Email
    String email;

    @NotBlank(message = "Username is required")
    String username;

    @NotBlank(message = "OTP is required")
    String otp;

    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*?])[A-Za-z\\d!@#$%^&*?]{8,255}$",
            message = "Password must be at least 8 characters with uppercase, lowercase, number, and special character")
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
    String newPassword;

    @NotBlank(message = "Confirm password is required")
    String confirm;
}
