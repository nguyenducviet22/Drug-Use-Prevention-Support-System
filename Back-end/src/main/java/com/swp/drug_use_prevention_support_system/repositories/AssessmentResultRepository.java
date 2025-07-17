package com.swp.drug_use_prevention_support_system.repositories;

import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, UUID> {
    List<AssessmentResult> findByUserUsername(String loginUsername);

    @Query("SELECT COUNT(DISTINCT a.user.username) FROM AssessmentResult a WHERE a.riskLevel = 'HIGH' AND YEAR(a.completedTime) = :year AND MONTH(a.completedTime) = :month")
    int countHighRiskUsersInMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT ar.riskLevel, COUNT(ar) FROM AssessmentResult ar GROUP BY ar.riskLevel")
    List<Object[]> countByRiskLevel();
}
