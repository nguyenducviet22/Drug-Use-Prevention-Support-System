package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "enrollment_id")
    UUID enrollmentID;
    @Enumerated(EnumType.STRING)
    EnrollmentStatus status;
    LocalDateTime startDate;
    LocalDateTime endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    Course course;
}
