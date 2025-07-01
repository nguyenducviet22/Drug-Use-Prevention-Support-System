package com.swp.drug_use_prevention_support_system.domain.dtos.responses;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {

    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate date;
    String month;
    int totalMembers;
    int staffMembers;
    int consultants;
    int monthlyConsultations;
    int activeCourses;
    int blogs;
    int events;
    int courses;
}
