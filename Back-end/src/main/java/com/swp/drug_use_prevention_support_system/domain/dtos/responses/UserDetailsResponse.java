package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDetailsResponse {

    UUID detailID;
    String fullName;
    String phoneNumber;
    String relationship;
    String address;
    UserStatus status;
    String createdAt;
    String updatedAt;
    UserResponse member;
}
