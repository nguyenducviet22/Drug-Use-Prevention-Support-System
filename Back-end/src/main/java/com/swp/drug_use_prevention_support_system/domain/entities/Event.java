package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.Instant;
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
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "event_id")
    UUID eventID;
    String eventName;
    String subTitle;
    Integer duration;
    Integer quantity;
    String description;
    String image;
    @Enumerated(EnumType.STRING)
    EventStatus status;
    LocalDateTime startDate;
    LocalDateTime endDate;
    @Enumerated(EnumType.STRING)
    AgeGroup ageGroup;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String location;
    Double fee;
    String details;

    @ManyToMany(mappedBy = "events")
    List<User> members = new ArrayList<>();

    @OneToMany(mappedBy = "event")
    List<Survey> surveys = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "created_by_staff", nullable = false, updatable = false)
    User createdByStaff;

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
