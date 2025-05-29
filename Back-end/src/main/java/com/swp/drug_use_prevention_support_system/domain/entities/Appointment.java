package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
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
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "appointment_id")
    UUID appointmentID;
    String notes;
    @Enumerated(EnumType.STRING)
    AppointmentStatus status;
    LocalDateTime createdAt;
    LocalDateTime appointmentDateTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id", nullable = false)
    User consultant;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.appointmentDateTime = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.appointmentDateTime = LocalDateTime.now();
    }
}
