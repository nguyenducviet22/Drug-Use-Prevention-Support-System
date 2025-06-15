package com.swp.drug_use_prevention_support_system.domain.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonContent {

    @NotBlank
    String sectionTitle;

    @NotEmpty
    List<@NotBlank String> sectionCategories;

    @NotBlank
    String sectionText;

    @NotEmpty
    List<@NotBlank String> sectionResources;
}
