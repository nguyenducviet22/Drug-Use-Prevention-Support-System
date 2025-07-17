package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResultResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.mappers.AssessmentResultMapper;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentResultRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssessmentResultService {

    private final AssessmentResultRepository assessmentResultRepository;
    private final AssessmentResultMapper assessmentResultMapper;

    @PreAuthorize("hasRole('STAFF')")
    public List<AssessmentResultResponse> getAllAssessmentResults() {
        List<AssessmentResult> results = assessmentResultRepository.findAll();
        return results.stream()
                .map(result -> assessmentResultMapper.toDto(result))
                .toList();
    }

    public List<AssessmentResultResponse> getUserAssessmentResults(String username) {
        List<AssessmentResult> results = assessmentResultRepository.findByUserUsername(username);
        return results.stream()
                .map(result -> assessmentResultMapper.toDto(result))
                .toList();
    }

    @PostAuthorize("returnObject.user.username == authentication.name || hasAnyRole('CONSULTANT', 'STAFF')")
    public AssessmentResultResponse getAssessmentResult(UUID assessmentResultID) {
        AssessmentResult result = assessmentResultRepository.findById(assessmentResultID)
                .orElseThrow(() -> new EntityNotFoundException("Assessment dose not exist with ID: " + assessmentResultID));
        return assessmentResultMapper.toDto(result);
    }

    //ADMIN HOMEPAGE
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getHighRiskStats() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        int current = assessmentResultRepository.countHighRiskUsersInMonth(
                currentMonth.getYear(), currentMonth.getMonthValue());

        int previous = assessmentResultRepository.countHighRiskUsersInMonth(
                lastMonth.getYear(), lastMonth.getMonthValue());

        int growth = current - previous;
        double percentChange = previous > 0 ? ((double) growth / previous) * 100 : 0;

        Map<String, Object> response = new HashMap<>();
        response.put("highRiskUsers", current);
        response.put("growthPercent", Math.round(percentChange));

        return response;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAssessmentRiskStats() {
        List<Object[]> result = assessmentResultRepository.countByRiskLevel();

        Map<String, Integer> data = new HashMap<>();
        for (Object[] row : result) {
            RiskLevel riskLevel = (RiskLevel) row[0];
            Long count = (Long) row[1];
            data.put(riskLevel.name(), count.intValue());
        }

        return Map.of("labels", data.keySet(), "data", data.values());
    }
}
