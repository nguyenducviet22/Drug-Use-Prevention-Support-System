package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.entities.User;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
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
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    User member;
}
