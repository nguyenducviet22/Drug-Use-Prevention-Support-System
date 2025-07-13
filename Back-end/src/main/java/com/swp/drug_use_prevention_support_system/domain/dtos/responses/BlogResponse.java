package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogType;
import lombok.*;
import lombok.experimental.FieldDefaults;


import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BlogResponse {

    UUID blogID;
    String blogName;
    Integer rate;
    String image;
    String description;
    String content;
    Integer readingTime;
    BlogType blogType;
    BlogStatus blogStatus;
    AgeGroup ageGroup;
    String createdAt;
    String updatedAt;
    UserResponse member;
}
