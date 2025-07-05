package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.Instant;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssessmentResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assessment_result_id")
    UUID assessmentResultID;
    Integer score;
    @Enumerated(EnumType.STRING)
    RiskLevel riskLevel;
    String suggestedAction;
    Instant completedTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "username", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    Assessment assessment;
}
