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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssessmentServiceTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentMapper assessmentMapper;

    @InjectMocks
    private AssessmentService assessmentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // Helper method to set authentication context with specific roles
    private void setAuthentication(String username, String... roles) {
        List<GrantedAuthority> authorities = Stream.of(roles)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, "password", authorities));
    }

    // --- 1. createAssessment tests ---
    @Test
    void testCreateAssessment_Success_StaffRole() {
        // Arrange
        setAuthentication("staffUser", "STAFF");
        CreateAssessmentRequest request = CreateAssessmentRequest.builder()
                .assessmentType(AssessmentType.CRAFFT)
                .linkTest("http://example.com/initial")
                .description("Initial assessment")
                .details("Details for initial")
                .image("image_url")
                .build();
        Assessment newAssessment = new Assessment();
        AssessmentResponse expectedResponse = AssessmentResponse.builder()
                .assessmentID(UUID.randomUUID())
                .assessmentType(AssessmentType.CRAFFT)
                .status(CourseStatus.AVAILABLE)
                .build();

        when(assessmentMapper.toEntity(request)).thenReturn(newAssessment);
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(newAssessment);
        when(assessmentMapper.toDto(newAssessment)).thenReturn(expectedResponse);

        // Act
        AssessmentResponse actualResponse = assessmentService.createAssessment(request);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(expectedResponse.getAssessmentID(), actualResponse.getAssessmentID());
        assertEquals(CourseStatus.AVAILABLE, newAssessment.getStatus());
        verify(assessmentMapper).toEntity(request);
        verify(assessmentRepository).save(newAssessment);
        verify(assessmentMapper).toDto(newAssessment);
    }

    // --- 2. getAllAssessments tests ---
    @Test
    void testGetAllAssessments_Success() {
        // Arrange
        List<Assessment> assessments = Arrays.asList(new Assessment(), new Assessment());
        List<AssessmentResponse> expectedResponses = Arrays.asList(new AssessmentResponse(), new AssessmentResponse());

        when(assessmentRepository.findAll()).thenReturn(assessments);
        when(assessmentMapper.toDto(any(Assessment.class))).thenReturn(new AssessmentResponse()); // Mock all toDto calls

        // Act
        List<AssessmentResponse> actualResponses = assessmentService.getAllAssessments();

        // Assert
        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(assessmentRepository).findAll();
        verify(assessmentMapper, times(2)).toDto(any(Assessment.class));
    }

    @Test
    void testGetAllAssessments_NoAssessmentsFound() {
        // Arrange
        when(assessmentRepository.findAll()).thenReturn(Collections.emptyList());

        // Act
        List<AssessmentResponse> actualResponses = assessmentService.getAllAssessments();

        // Assert
        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(assessmentRepository).findAll();
        verifyNoInteractions(assessmentMapper);
    }

    // --- 3. getAssessmentEntity(UUID assessmentID) tests ---
    @Test
    void testGetAssessmentEntityById_Success() {
        // Arrange
        UUID id = UUID.randomUUID();
        Assessment assessment = new Assessment();
        when(assessmentRepository.findById(id)).thenReturn(Optional.of(assessment));

        // Act
        Assessment actualAssessment = assessmentService.getAssessmentEntity(id);

        // Assert
        assertNotNull(actualAssessment);
        assertEquals(assessment, actualAssessment);
        verify(assessmentRepository).findById(id);
    }

    @Test
    void testGetAssessmentEntityById_NotFound() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(assessmentRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> assessmentService.getAssessmentEntity(id));
        assertEquals("Assessment dose not exist with ID: " + id, exception.getMessage());
        verify(assessmentRepository).findById(id);
    }

    // --- 4. getAssessmentEntity(AssessmentType type) tests ---
    @Test
    void testGetAssessmentEntityByType_Success() {
        // Arrange
        AssessmentType type = AssessmentType.CRAFFT;
        Assessment assessment = new Assessment();
        when(assessmentRepository.findByAssessmentType(type)).thenReturn(Optional.of(assessment));

        // Act
        Assessment actualAssessment = assessmentService.getAssessmentEntity(type);

        // Assert
        assertNotNull(actualAssessment);
        assertEquals(assessment, actualAssessment);
        verify(assessmentRepository).findByAssessmentType(type);
    }

    @Test
    void testGetAssessmentEntityByType_NotFound() {
        // Arrange
        AssessmentType type = AssessmentType.CRAFFT;
        when(assessmentRepository.findByAssessmentType(type)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> assessmentService.getAssessmentEntity(type));
        assertEquals("Assessment dose not exist with type: " + type, exception.getMessage());
        verify(assessmentRepository).findByAssessmentType(type);
    }

    // --- 5. getAssessment(UUID assessmentID) tests ---
    @Test
    void testGetAssessmentById_Success() {
        // Arrange
        UUID id = UUID.randomUUID();
        Assessment assessment = new Assessment();
        AssessmentResponse expectedResponse = new AssessmentResponse();

        when(assessmentRepository.findById(id)).thenReturn(Optional.of(assessment));
        when(assessmentMapper.toDto(assessment)).thenReturn(expectedResponse);

        // Act
        AssessmentResponse actualResponse = assessmentService.getAssessment(id);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(expectedResponse, actualResponse);
        verify(assessmentRepository).findById(id);
        verify(assessmentMapper).toDto(assessment);
    }

    @Test
    void testGetAssessmentById_NotFound() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(assessmentRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> assessmentService.getAssessment(id));
        assertEquals("Assessment dose not exist with ID: " + id, exception.getMessage());
        verify(assessmentRepository).findById(id);
        verifyNoInteractions(assessmentMapper);
    }

    // --- 6. getAssessmentByType(AssessmentType type) tests ---
    @Test
    void testGetAssessmentByType_Success() {
        // Arrange
        AssessmentType type = AssessmentType.CRAFFT;
        Assessment assessment = new Assessment();
        AssessmentResponse expectedResponse = new AssessmentResponse();

        when(assessmentRepository.findByAssessmentType(type)).thenReturn(Optional.of(assessment));
        when(assessmentMapper.toDto(assessment)).thenReturn(expectedResponse);

        // Act
        AssessmentResponse actualResponse = assessmentService.getAssessmentByType(type);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(expectedResponse, actualResponse);
        verify(assessmentRepository).findByAssessmentType(type);
        verify(assessmentMapper).toDto(assessment);
    }

    @Test
    void testGetAssessmentByType_NotFound() {
        // Arrange
        AssessmentType type = AssessmentType.CRAFFT;
        when(assessmentRepository.findByAssessmentType(type)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> assessmentService.getAssessmentByType(type));
        assertEquals("Assessment dose not exist with type: " + type, exception.getMessage());
        verify(assessmentRepository).findByAssessmentType(type);
        verifyNoInteractions(assessmentMapper);
    }

    // --- 7. updateAssessment tests ---
    @Test
    void testUpdateAssessment_Success_StaffRole() {
        // Arrange
        setAuthentication("staffUser", "STAFF");
        UUID id = UUID.randomUUID();
        UpdateAssessmentRequest request = UpdateAssessmentRequest.builder()
                .image("new_image_url")
                .assessmentType(AssessmentType.CRAFFT)
                .linkTest("http://example.com/final_updated")
                .description("Final assessment updated")
                .details("Updated details")
                .build();
        Assessment existingAssessment = new Assessment();
        existingAssessment.setAssessmentID(id);
        existingAssessment.setImage("old_image_url");
        existingAssessment.setAssessmentType(AssessmentType.CRAFFT);
        existingAssessment.setLinkTest("http://example.com/initial");
        existingAssessment.setDescription("Initial description");
        existingAssessment.setDetails("Old details");
        existingAssessment.setStatus(CourseStatus.AVAILABLE);

        AssessmentResponse expectedResponse = AssessmentResponse.builder()
                .assessmentID(id)
                .image("new_image_url")
                .assessmentType(AssessmentType.CRAFFT)
                .linkTest("http://example.com/final_updated")
                .description("Final assessment updated")
                .details("Updated details")
                .status(CourseStatus.AVAILABLE)
                .build();

        when(assessmentRepository.findById(id)).thenReturn(Optional.of(existingAssessment));
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(existingAssessment);
        when(assessmentMapper.toDto(existingAssessment)).thenReturn(expectedResponse);

        // Act
        AssessmentResponse actualResponse = assessmentService.updateAssessment(id, request);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(expectedResponse.getAssessmentID(), actualResponse.getAssessmentID());
        assertEquals(request.getImage(), existingAssessment.getImage());
        assertEquals(request.getAssessmentType(), existingAssessment.getAssessmentType());
        assertEquals(request.getLinkTest(), existingAssessment.getLinkTest());
        assertEquals(request.getDescription(), existingAssessment.getDescription());
        assertEquals(request.getDetails(), existingAssessment.getDetails());
        verify(assessmentRepository).findById(id);
        verify(assessmentRepository).save(existingAssessment);
        verify(assessmentMapper).toDto(existingAssessment);
    }

    @Test
    void testUpdateAssessment_NotFound() {
        // Arrange
        setAuthentication("staffUser", "STAFF");
        UUID id = UUID.randomUUID();
        UpdateAssessmentRequest request = UpdateAssessmentRequest.builder()
                .assessmentType(AssessmentType.CRAFFT)
                .linkTest("http://example.com/final_updated")
                .description("Final assessment updated")
                .build();

        when(assessmentRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> assessmentService.updateAssessment(id, request));
        assertEquals("Assessment dose not exist with ID: " + id, exception.getMessage());
        verify(assessmentRepository).findById(id);
        verifyNoMoreInteractions(assessmentRepository, assessmentMapper);
    }

    // --- 8. updateAssessmentStatus tests ---
    @Test
    void testUpdateAssessmentStatus_Success_StaffRole() {
        // Arrange
        setAuthentication("staffUser", "STAFF");
        UUID id = UUID.randomUUID();
        CourseStatus newStatus = CourseStatus.UNAVAILABLE;
        Assessment existingAssessment = new Assessment();
        existingAssessment.setAssessmentID(id);
        existingAssessment.setStatus(CourseStatus.AVAILABLE);

        when(assessmentRepository.findById(id)).thenReturn(Optional.of(existingAssessment));
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(existingAssessment);

        // Act
        assessmentService.updateAssessmentStatus(id, newStatus);

        // Assert
        assertEquals(newStatus, existingAssessment.getStatus());
        verify(assessmentRepository).findById(id);
        verify(assessmentRepository).save(existingAssessment);
    }

    @Test
    void testUpdateAssessmentStatus_NotFound() {
        // Arrange
        setAuthentication("staffUser", "STAFF");
        UUID id = UUID.randomUUID();
        CourseStatus newStatus = CourseStatus.UNAVAILABLE;

        when(assessmentRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> assessmentService.updateAssessmentStatus(id, newStatus));
        assertEquals("Assessment dose not exist with ID: " + id, exception.getMessage());
        verify(assessmentRepository).findById(id);
        verifyNoMoreInteractions(assessmentRepository, assessmentMapper);
    }

    @Test
    void testUpdateAssessmentStatus_ValidStatusTransition() {
        // Arrange
        setAuthentication("staffUser", "STAFF");
        UUID id = UUID.randomUUID();
        CourseStatus initialStatus = CourseStatus.AVAILABLE;
        CourseStatus targetStatus = CourseStatus.REJECTED; // Any valid enum value
        Assessment existingAssessment = new Assessment();
        existingAssessment.setAssessmentID(id);
        existingAssessment.setStatus(initialStatus);

        when(assessmentRepository.findById(id)).thenReturn(Optional.of(existingAssessment));
        when(assessmentRepository.save(any(Assessment.class))).thenReturn(existingAssessment);

        // Act
        assessmentService.updateAssessmentStatus(id, targetStatus);

        // Assert
        assertEquals(targetStatus, existingAssessment.getStatus());
        verify(assessmentRepository).findById(id);
        verify(assessmentRepository).save(existingAssessment);
    }
}