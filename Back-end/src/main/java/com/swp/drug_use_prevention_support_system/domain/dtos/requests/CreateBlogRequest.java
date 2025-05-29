package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.BlogType;
import jakarta.validation.constraints.Min;
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
public class CreateBlogRequest {

    @NotBlank(message = "Blog name is required")
    @Size(max = 255, message = "Blog name must be at most 255 characters")
    String blogName;

    @Min(value = 0, message = "Rate cannot be negative")
    Integer rate;

    @Size(max = 255, message = "Image URL must be at most 255 characters")
    String img;

    @NotBlank(message = "Description is required")
    String description;

    @NotNull(message = "Blog type is required")
    BlogType blogType;

    @NotBlank(message = "Username is required")
    String username;
}
