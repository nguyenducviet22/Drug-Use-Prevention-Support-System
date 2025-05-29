package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.NotificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateNotificationRequest {

    @NotBlank(message = "Title is required")
    String title;

    @NotBlank(message = "Description is required")
    String description;

    @NotNull(message = "Notification status is required")
    NotificationStatus status;
}
