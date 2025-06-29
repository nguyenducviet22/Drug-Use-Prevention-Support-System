package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Assessment;
import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.mappers.AssessmentMapper;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
        newAssessment.setStatus(CourseStatus.AVAILABLE);
        assessmentRepository.save(newAssessment);
        return assessmentMapper.toDto(newAssessment);
    }

    public List<AssessmentResponse> getAllAssessments() {
        List<Assessment> assessments = assessmentRepository.findAll();
        return assessments.stream()
                .map(assessment -> assessmentMapper.toDto(assessment))
                .toList();
    }

    public Assessment getAssessmentEntity(UUID assessmentID) {
        return assessmentRepository.findById(assessmentID)
                .orElseThrow(() -> new EntityNotFoundException("Assessment dose not exist with ID: " + assessmentID));
    }

    public Assessment getAssessmentEntity(AssessmentType type) {
        return assessmentRepository.findByAssessmentType(type)
                .orElseThrow(() -> new EntityNotFoundException("Assessment dose not exist with type: " + type));
    }

    public AssessmentResponse getAssessment(UUID assessmentID) {
        Assessment assessment = getAssessmentEntity(assessmentID);
        return assessmentMapper.toDto(assessment);
    }

    @PreAuthorize("hasRole('STAFF')")
    public AssessmentResponse updateAssessment(UUID assessmentID, UpdateAssessmentRequest request) {
        Assessment assessment = getAssessmentEntity(assessmentID);
        assessment.setImg(request.getImg());
        assessment.setAssessmentType(request.getAssessmentType());
        assessment.setLinkTest(request.getLinkTest());
        assessment.setDescription(request.getDescription());
        assessment.setDetails(request.getDetails());
        assessmentRepository.save(assessment);
        return assessmentMapper.toDto(assessment);
    }

    @PreAuthorize("hasRole('STAFF')")
    public void updateAssessmentStatus(UUID assessmentID, CourseStatus status) {
        Assessment assessment = getAssessmentEntity(assessmentID);
        assessment.setStatus(status);
        assessmentRepository.save(assessment);
    }
}
