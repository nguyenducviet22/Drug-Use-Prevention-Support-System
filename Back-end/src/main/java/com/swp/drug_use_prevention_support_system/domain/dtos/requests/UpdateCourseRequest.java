package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateCourseRequest {

    @NotBlank(message = "Course name is required")
    @Size(max = 255, message = "Course name must be at most 255 characters")
    String courseName;

    @Positive(message = "Duration must be a positive number")
    Integer duration;

    @PositiveOrZero(message = "Quantity cannot be negative")
    Integer quantity;

    @Size(max = 255, message = "Image URL must be at most 255 characters")
    String img;

    @NotBlank(message = "Description is required")
    String description;

    @NotNull(message = "Age group is required")
    AgeGroup ageGroup;

    @NotNull(message = "Status is required")
    CourseStatus status;
}
