package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResultResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.mappers.AssessmentResultMapper;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentResultRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssessmentResultServiceTest {

    @Mock
    private AssessmentResultRepository assessmentResultRepository;

    @Mock
    private AssessmentResultMapper assessmentResultMapper;

    @InjectMocks
    private AssessmentResultService assessmentResultService;

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

    // --- 1. getAllAssessmentResults tests ---
    @Test
    void testGetAllAssessmentResults_StaffRole() {
        // Arrange
        setAuthentication("staffUser", "STAFF");

        AssessmentResult result1 = new AssessmentResult();
        AssessmentResult result2 = new AssessmentResult();
        List<AssessmentResult> mockResults = Arrays.asList(result1, result2);

        AssessmentResultResponse response1 = new AssessmentResultResponse();
        AssessmentResultResponse response2 = new AssessmentResultResponse();
        List<AssessmentResultResponse> expectedResponses = Arrays.asList(response1, response2);

        when(assessmentResultRepository.findAll()).thenReturn(mockResults);
        when(assessmentResultMapper.toDto(result1)).thenReturn(response1);
        when(assessmentResultMapper.toDto(result2)).thenReturn(response2);

        // Act
        List<AssessmentResultResponse> actualResponses = assessmentResultService.getAllAssessmentResults();

        // Assert
        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        assertEquals(expectedResponses, actualResponses);
        verify(assessmentResultRepository).findAll();
        verify(assessmentResultMapper, times(2)).toDto(any(AssessmentResult.class));
    }

    // --- 2. getUserAssessmentResults tests ---
    @Test
    void testGetUserAssessmentResults_Success() {
        // Arrange
        String username = "testUser";
        AssessmentResult result1 = new AssessmentResult();
        User user1 = new User();
        user1.setUsername(username);
        result1.setUser(user1);

        AssessmentResult result2 = new AssessmentResult();
        User user2 = new User();
        user2.setUsername(username);
        result2.setUser(user2);
        List<AssessmentResult> mockResults = Arrays.asList(result1, result2);

        AssessmentResultResponse response1 = new AssessmentResultResponse();
        AssessmentResultResponse response2 = new AssessmentResultResponse();
        List<AssessmentResultResponse> expectedResponses = Arrays.asList(response1, response2);

        when(assessmentResultRepository.findByUserUsername(username)).thenReturn(mockResults);
        when(assessmentResultMapper.toDto(result1)).thenReturn(response1);
        when(assessmentResultMapper.toDto(result2)).thenReturn(response2);

        // Act
        List<AssessmentResultResponse> actualResponses = assessmentResultService.getUserAssessmentResults(username);

        // Assert
        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        assertEquals(expectedResponses, actualResponses);
        verify(assessmentResultRepository).findByUserUsername(username);
        verify(assessmentResultMapper, times(2)).toDto(any(AssessmentResult.class));
    }

    @Test
    void testGetUserAssessmentResults_NoResultsFound() {
        // Arrange
        String username = "nonExistentUser";
        when(assessmentResultRepository.findByUserUsername(username)).thenReturn(Collections.emptyList());

        // Act
        List<AssessmentResultResponse> actualResponses = assessmentResultService.getUserAssessmentResults(username);

        // Assert
        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(assessmentResultRepository).findByUserUsername(username);
        verifyNoInteractions(assessmentResultMapper);
    }

    // --- 3. getAssessmentResult tests ---
    @Test
    void testGetAssessmentResult_Success_Owner() {
        // Arrange
        UUID assessmentResultID = UUID.randomUUID();
        String currentUsername = "ownerUser";
        setAuthentication(currentUsername, "MEMBER"); // Authenticated as the owner

        User user = new User();
        user.setUsername(currentUsername);

        AssessmentResult result = new AssessmentResult();
        result.setAssessmentResultID(assessmentResultID);
        result.setUser(user); // Link the result to the authenticated user

        AssessmentResultResponse expectedResponse = AssessmentResultResponse.builder()
                .assessmentResultID(assessmentResultID)
                .user(UserResponse.builder().username(currentUsername).build())
                .build();

        when(assessmentResultRepository.findById(assessmentResultID)).thenReturn(Optional.of(result));
        when(assessmentResultMapper.toDto(result)).thenReturn(expectedResponse);

        // Act
        AssessmentResultResponse actualResponse = assessmentResultService.getAssessmentResult(assessmentResultID);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(assessmentResultID, actualResponse.getAssessmentResultID());
        assertEquals(currentUsername, actualResponse.getUser().getUsername());
        verify(assessmentResultRepository).findById(assessmentResultID);
        verify(assessmentResultMapper).toDto(result);
    }

    @Test
    void testGetAssessmentResult_Success_ConsultantOrStaff() {
        // Arrange
        UUID assessmentResultID = UUID.randomUUID();
        String ownerUsername = "someUser";
        setAuthentication("consultantUser", "CONSULTANT"); // Authenticated as consultant

        User owner = new User();
        owner.setUsername(ownerUsername);

        AssessmentResult result = new AssessmentResult();
        result.setAssessmentResultID(assessmentResultID);
        result.setUser(owner); // Owned by a different user

        AssessmentResultResponse expectedResponse = AssessmentResultResponse.builder()
                .assessmentResultID(assessmentResultID)
                .user(UserResponse.builder().username(ownerUsername).build())
                .build();

        when(assessmentResultRepository.findById(assessmentResultID)).thenReturn(Optional.of(result));
        when(assessmentResultMapper.toDto(result)).thenReturn(expectedResponse);

        // Act
        AssessmentResultResponse actualResponse = assessmentResultService.getAssessmentResult(assessmentResultID);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(assessmentResultID, actualResponse.getAssessmentResultID());
        assertEquals(ownerUsername, actualResponse.getUser().getUsername());
        verify(assessmentResultRepository).findById(assessmentResultID);
        verify(assessmentResultMapper).toDto(result);
    }


    @Test
    void testGetAssessmentResult_NotFound() {
        // Arrange
        UUID assessmentResultID = UUID.randomUUID();
        setAuthentication("anyUser", "MEMBER"); // Role doesn't matter for NotFound

        when(assessmentResultRepository.findById(assessmentResultID)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> assessmentResultService.getAssessmentResult(assessmentResultID));

        assertEquals("Assessment dose not exist with ID: " + assessmentResultID, exception.getMessage());
        verify(assessmentResultRepository).findById(assessmentResultID);
        verifyNoInteractions(assessmentResultMapper);
    }
}