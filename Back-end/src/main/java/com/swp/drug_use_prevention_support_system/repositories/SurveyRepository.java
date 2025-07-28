package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.Survey;
import com.swp.drug_use_prevention_support_system.domain.enums.SurveyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, UUID> {
    boolean existsByEventEventIDAndType(UUID eventID, SurveyType type);
}
