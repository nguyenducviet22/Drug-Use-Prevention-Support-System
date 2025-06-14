package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
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
    Integer duration;
    Integer quantity;
    String description;
    String img;
    @Enumerated(EnumType.STRING)
    EventStatus status;
    LocalDate startDate;
    LocalDate endDate;
    @Enumerated(EnumType.STRING)
    AgeGroup ageGroup;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @ManyToMany(mappedBy = "events")
    List<User> members = new ArrayList<>();

    @OneToMany(mappedBy = "event")
    List<Survey> surveys = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    User createdBy;

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
