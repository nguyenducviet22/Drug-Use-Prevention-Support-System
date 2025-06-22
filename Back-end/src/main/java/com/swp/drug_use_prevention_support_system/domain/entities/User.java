package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.Gender;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    String username;
    String password;
    String email;
    String fullName;
    LocalDate dob;
    @Enumerated(EnumType.STRING)
    Gender gender;
    String phoneNumber;
    String job;
    String address;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    @Enumerated(EnumType.STRING)
    Role role;
    @Enumerated(EnumType.STRING)
    UserStatus status;
    @Enumerated(EnumType.STRING)
    AgeGroup ageGroup;

    @OneToMany(mappedBy = "member")
    List<UserDetails> userDetailsList = new ArrayList<>();

    @OneToMany(mappedBy = "consultant")
    List<Qualification> qualifications = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    List<AssessmentResult> assessmentResults = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    List<Appointment> memberAppointments = new ArrayList<>();

    @OneToMany(mappedBy = "consultant")
    List<Appointment> consultantAppointments = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "user_notification",
            joinColumns = @JoinColumn(name = "username"),
            inverseJoinColumns = @JoinColumn(name = "notification_id")
    )
    List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    List<Enrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "member")
    List<Blog> blogs = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "user_event",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "event_id")
    )
    List<Event> events = new ArrayList<>();

    @OneToMany(mappedBy = "consultant")
    List<Availability> consultantAvailabilities = new ArrayList<>();

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
