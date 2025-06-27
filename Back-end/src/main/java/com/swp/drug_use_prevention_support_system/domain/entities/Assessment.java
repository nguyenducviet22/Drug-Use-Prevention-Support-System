package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assessment_id")
    UUID assessmentID;
    String img;
    @Enumerated(EnumType.STRING)
    AssessmentType assessmentType;
    String linkTest;
    String description;
    String details;
    @Enumerated(EnumType.STRING)
    CourseStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "assessment")
    List<AssessmentResult> assessmentResults = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
