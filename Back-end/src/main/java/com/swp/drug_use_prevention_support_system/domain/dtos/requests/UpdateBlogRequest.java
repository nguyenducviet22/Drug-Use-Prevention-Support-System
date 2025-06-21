package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateBlogRequest {

    @NotBlank(message = "Blog name is required")
    @Size(max = 255, message = "Blog name must be at most 255 characters")
    String blogName;

    @Size(max = 255, message = "Image URL must be at most 255 characters")
    String img;

    @NotBlank(message = "Description is required")
    String description;

    @NotBlank(message = "Content is required")
    String content;

    @NotNull(message = "Blog type is required")
    BlogType blogType;

    @NotNull(message = "Blog status is required")
    BlogStatus blogStatus;

    @NotNull(message = "Age group is required")
    AgeGroup ageGroup;
}
