package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Assessment;
import com.swp.drug_use_prevention_support_system.mappers.AssessmentMapper;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentMapper assessmentMapper;

    @PreAuthorize("hasRole('STAFF')")
    public AssessmentResponse createAssessment(CreateAssessmentRequest request) {
        Assessment newAssessment = assessmentMapper.toEntity(request);
        assessmentRepository.save(newAssessment);
        return assessmentMapper.toDto(newAssessment);
    }

    public List<AssessmentResponse> getAllAssessments() {
        List<Assessment> assessments = assessmentRepository.findAll();
        return assessments.stream()
                .map(assessment -> assessmentMapper.toDto(assessment))
                .toList();
    }

    public Assessment getAssessmentByType(String type) {
        return assessmentRepository.findByAssessmentType(type)
                .orElseThrow(() -> new EntityNotFoundException("Assessment dose not exist with type: " + type));
    }

    public AssessmentResponse getAssessment(UUID assessmentID) {
        Assessment assessment = assessmentRepository.findById(assessmentID)
                .orElseThrow(() -> new EntityNotFoundException("Assessment dose not exist with ID: " + assessmentID));
        return assessmentMapper.toDto(assessment);
    }
}
