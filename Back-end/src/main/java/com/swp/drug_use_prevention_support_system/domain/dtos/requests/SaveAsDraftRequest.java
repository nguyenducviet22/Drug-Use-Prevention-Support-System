package com.swp.drug_use_prevention_support_system.domain.dtos.requests;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SaveAsDraftRequest {

    // eventName thường là bắt buộc ngay cả với draft để định danh
    @NotBlank(message = "Event name must not be blank.")
    String eventName;

    String subTitle;
    Integer duration;
    Integer quantity;
    String description;
    String image;
    AgeGroup ageGroup;
    LocalDateTime startDate;
    LocalDateTime endDate;
    String location;
    Double fee;
    String details;
}
