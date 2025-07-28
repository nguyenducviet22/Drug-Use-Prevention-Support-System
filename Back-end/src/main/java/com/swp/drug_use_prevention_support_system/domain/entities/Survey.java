package com.swp.drug_use_prevention_support_system.domain.entities;

import com.swp.drug_use_prevention_support_system.domain.enums.SurveyStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.SurveyType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Survey {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "survey_id")
    UUID surveyID;

    @Column(length = 512)
    String formLink;

    @Enumerated(EnumType.STRING)
    SurveyType type;

    @ManyToOne
    @JoinColumn(name = "event_id")
    Event event;
}
