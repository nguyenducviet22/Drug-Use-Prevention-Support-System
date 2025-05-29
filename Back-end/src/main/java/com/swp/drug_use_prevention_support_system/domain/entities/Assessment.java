package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
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
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assessment_id")
    UUID assessmentID;
    String img;
    @Enumerated(EnumType.STRING)
    RiskLevel riskLevel;
    Integer score;
    String assessmentType;
    String suggestedAction;
    LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "username", nullable = false)
    User user;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
