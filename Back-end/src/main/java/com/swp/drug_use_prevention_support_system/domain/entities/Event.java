package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
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
    @Enumerated(EnumType.STRING)
    AgeGroup ageGroup;
    Instant startedAt;
    Instant endedAt;
    Instant createdAt;
    Instant updatedAt;

    @ManyToMany(mappedBy = "events")
    List<User> members = new ArrayList<>();

    @OneToMany(mappedBy = "event")
    List<Survey> surveys = new ArrayList<>();

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
