package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResultResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.mappers.AssessmentResultMapper;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentResultRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
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
}
