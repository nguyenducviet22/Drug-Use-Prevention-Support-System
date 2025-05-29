package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.Gender;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String username;
    String email;
    String fullName;
    LocalDate dob;
    Gender gender;
    String phoneNumber;
    String job;
    Role role;
    UserStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    List<NotificationResponse> notifications;
    List<EventResponse> events;
}
