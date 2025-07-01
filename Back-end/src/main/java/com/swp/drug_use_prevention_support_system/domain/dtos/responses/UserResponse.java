package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.Gender;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;



import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String username;
    String email;
    String fullName;
    Date dob;
    Gender gender;
    String phoneNumber;
    String job;
    Role role;
    String address;
    AgeGroup ageGroup;
    UserStatus status;
    String createdAt;
    String updatedAt;
}
