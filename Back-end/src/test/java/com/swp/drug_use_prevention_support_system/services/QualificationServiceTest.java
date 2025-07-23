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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QualificationServiceTest {

    @Mock
    private QualificationRepository qualificationRepository;

    @Mock
    private QualificationMapper qualificationMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private QualificationService qualificationService;

    private final UUID qualificationId = UUID.randomUUID();

    @Test
    void testCreateQualification_Success() {
        CreateQualificationRequest request = CreateQualificationRequest.builder()
                .name("Test Qualification")
                .degree(null)
                .institution("Test Institution")
                .year(2020)
                .build();

        Qualification qualification = Qualification.builder()
                .name("Test Qualification")
                .institution("Test Institution")
                .year(2020)
                .status(CourseStatus.AVAILABLE)
                .build();

        User consultant = User.builder().username("consultant1").build();
        QualificationResponse response = QualificationResponse.builder()
                .name("Test Qualification")
                .institution("Test Institution")
                .year(2020)
                .status(CourseStatus.AVAILABLE)
                .consultant(null)
                .build();

        when(qualificationMapper.toEntity(request)).thenReturn(qualification);
        when(userService.getLoginUsername()).thenReturn("consultant1");
        when(userService.getUserEntity("consultant1")).thenReturn(consultant);
        when(qualificationRepository.save(any(Qualification.class))).thenReturn(qualification);
        when(qualificationMapper.toDto(qualification)).thenReturn(response);

        QualificationResponse result = qualificationService.createQualification(request);

        assertEquals("Test Qualification", result.getName());
        assertEquals("Test Institution", result.getInstitution());
        assertEquals(2020, result.getYear());
        assertEquals(CourseStatus.AVAILABLE, result.getStatus());
        verify(qualificationRepository).save(qualification);
    }

    @Test
    void testGetAllQualifications_Success() {
        Qualification qualification1 = Qualification.builder().name("Q1").build();
        Qualification qualification2 = Qualification.builder().name("Q2").build();
        List<Qualification> qualifications = Arrays.asList(qualification1, qualification2);

        QualificationResponse response1 = QualificationResponse.builder().name("Q1").build();
        QualificationResponse response2 = QualificationResponse.builder().name("Q2").build();

        when(qualificationRepository.findAll()).thenReturn(qualifications);
        when(qualificationMapper.toDto(qualification1)).thenReturn(response1);
        when(qualificationMapper.toDto(qualification2)).thenReturn(response2);

        List<QualificationResponse> result = qualificationService.getAllQualifications();

        assertEquals(2, result.size());
        assertEquals("Q1", result.get(0).getName());
        assertEquals("Q2", result.get(1).getName());
    }

    @Test
    void testUpdateQualification_Success() {
        UpdateQualificationRequest request = UpdateQualificationRequest.builder()
                .name("Updated Name")
                .image("img.png")
                .degree(null)
                .institution("Updated Institution")
                .year(2022)
                .build();

        Qualification qualification = Qualification.builder()
                .qualificationID(qualificationId)
                .name("Old Name")
                .image("old.png")
                .degree(null)
                .institution("Old Institution")
                .year(2020)
                .build();

        QualificationResponse response = QualificationResponse.builder()
                .name("Updated Name")
                .image("img.png")
                .institution("Updated Institution")
                .year(2022)
                .build();

        when(qualificationRepository.findById(qualificationId)).thenReturn(Optional.of(qualification));
        when(qualificationRepository.save(any(Qualification.class))).thenReturn(qualification);
        when(qualificationMapper.toDto(qualification)).thenReturn(response);

        QualificationResponse result = qualificationService.updateQualification(qualificationId, request);

        assertEquals("Updated Name", result.getName());
        assertEquals("img.png", result.getImage());
        assertEquals("Updated Institution", result.getInstitution());
        assertEquals(2022, result.getYear());
        verify(qualificationRepository).save(qualification);
    }

    @Test
    void testGetQualification_NotFound() {
        when(qualificationRepository.findById(qualificationId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> qualificationService.getQualification(qualificationId));
    }

    @Test
    void testGetConsultantQualifications_Success() {
        String username = "consultant1";
        Qualification q1 = Qualification.builder().year(2022).build();
        Qualification q2 = Qualification.builder().year(2020).build();
        List<Qualification> qualifications = Arrays.asList(q1, q2);

        QualificationResponse r1 = QualificationResponse.builder().year(2022).build();
        QualificationResponse r2 = QualificationResponse.builder().year(2020).build();

        when(qualificationRepository.findByConsultantUsernameAndStatusOrderByYearDesc(username, CourseStatus.AVAILABLE))
                .thenReturn(qualifications);
        when(qualificationMapper.toDto(q1)).thenReturn(r1);
        when(qualificationMapper.toDto(q2)).thenReturn(r2);

        List<QualificationResponse> result = qualificationService.getConsultantQualifications(username);

        assertEquals(2, result.size());
        assertTrue(result.get(0).getYear() >= result.get(1).getYear());
    }

    @Test
    void testUpdateQualification_QualificationNotFound() {
        UpdateQualificationRequest request = UpdateQualificationRequest.builder().build();
        when(qualificationRepository.findById(qualificationId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> qualificationService.updateQualification(qualificationId, request));
    }

    @Test
    void testQualificationEntityToResponseMapping() {
        Qualification qualification = Qualification.builder()
                .qualificationID(qualificationId)
                .name("Test")
                .image("img.png")
                .degree(null)
                .institution("Inst")
                .year(2021)
                .status(CourseStatus.AVAILABLE)
                .consultant(User.builder().username("consultant1").build())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        QualificationResponse response = QualificationResponse.builder()
                .qualificationID(qualificationId)
                .name("Test")
                .image("img.png")
                .degree(null)
                .institution("Inst")
                .year(2021)
                .status(CourseStatus.AVAILABLE)
                .consultant(com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse.builder().username("consultant1").build())
                .createdAt("2023-01-01T00:00:00Z")
                .updatedAt("2023-01-01T00:00:00Z")
                .build();

        when(qualificationMapper.toDto(qualification)).thenReturn(response);

        QualificationResponse result = qualificationMapper.toDto(qualification);

        assertEquals(qualificationId, result.getQualificationID());
        assertEquals("Test", result.getName());
        assertEquals("img.png", result.getImage());
        assertEquals("Inst", result.getInstitution());
        assertEquals(2021, result.getYear());
        assertEquals(CourseStatus.AVAILABLE, result.getStatus());
        assertEquals("consultant1", result.getConsultant().getUsername());
    }

    @Test
    void testGetAllQualifications_Unauthorized() {
        // Simulate security: throw AccessDeniedException
        doThrow(new AccessDeniedException("Access is denied")).when(qualificationRepository).findAll();

        assertThrows(AccessDeniedException.class, () -> qualificationService.getAllQualifications());
    }
}