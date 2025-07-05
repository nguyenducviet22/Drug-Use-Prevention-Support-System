package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.QualificationResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Qualification;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.mappers.QualificationMapper;
import com.swp.drug_use_prevention_support_system.repositories.QualificationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QualificationService {

    private final QualificationRepository qualificationRepository;
    private final QualificationMapper qualificationMapper;
    private final UserService userService;

    @PreAuthorize("hasRole('CONSULTANT')")
    public QualificationResponse createQualification(CreateQualificationRequest request) {
        Qualification qualification = qualificationMapper.toEntity(request);
        qualification.setStatus(CourseStatus.AVAILABLE);
        String username = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(username);
        qualification.setConsultant(loginUser);
        qualificationRepository.save(qualification);
        return qualificationMapper.toDto(qualification);
    }

    @PreAuthorize("hasRole('STAFF')")
    public List<QualificationResponse> getAllQualifications() {
        List<Qualification> qualifications = qualificationRepository.findAll();
        return qualifications.stream()
                .map(qualification -> qualificationMapper.toDto(qualification))
                .toList();
    }

    public List<QualificationResponse> getConsultantQualifications(String username) {
        List<Qualification> qualifications = qualificationRepository.findByConsultantUsernameAndStatusOrderByYearDesc(username, CourseStatus.AVAILABLE);
        return qualifications.stream()
                .map(qualification -> qualificationMapper.toDto(qualification))
                .toList();
    }

    public Qualification getQualificationEntity(UUID qualificationID) {
        return qualificationRepository.findById(qualificationID)
                .orElseThrow(() -> new EntityNotFoundException("Qualification does not exist with ID: " + qualificationID));
    }

    public QualificationResponse getQualification(UUID qualificationID) {
        Qualification qualification = getQualificationEntity(qualificationID);
        return qualificationMapper.toDto(qualification);
    }

    @PostAuthorize("returnObject.consultant.username == authentication.name")
    public QualificationResponse updateQualification(UUID qualificationID, UpdateQualificationRequest request) {
        Qualification qualification = getQualificationEntity(qualificationID);
        qualification.setName(request.getName());
        qualification.setImg(request.getImg());
        qualification.setDegree(request.getDegree());
        qualification.setInstitution(request.getInstitution());
        qualification.setYear(request.getYear());
        qualificationRepository.save(qualification);
        return qualificationMapper.toDto(qualification);
    }

    @PostAuthorize("returnObject.consultant.username == authentication.name")
    public QualificationResponse deleteQualification(UUID qualificationID) {
        Qualification qualification = qualificationMapper.toEntity(getQualification(qualificationID));
        qualification.setStatus(CourseStatus.UNAVAILABLE);
        qualificationRepository.save(qualification);
        return qualificationMapper.toDto(qualification);
    }
}
