package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.Instant;
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
public class Course {

    @Id
    @Column(name = "course_id")
    UUID courseID;
    String courseName;
    Integer quantity;
    Integer duration;
    String image;
    String description;
    @Enumerated(EnumType.STRING)
    AgeGroup ageGroup;
    @Enumerated(EnumType.STRING)
    CourseStatus status;
    Instant createdAt;
    Instant updatedAt;

    @OneToMany(mappedBy = "course")
    List<Enrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "course")
    List<Module> modules = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
