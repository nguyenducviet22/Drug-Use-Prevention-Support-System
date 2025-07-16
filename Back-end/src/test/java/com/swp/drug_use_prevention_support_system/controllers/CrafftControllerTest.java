package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CrafftSubmissionDTO;
import com.swp.drug_use_prevention_support_system.domain.entities.AssessmentResult;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.services.CrafftService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CrafftControllerTest {

    @Mock
    private CrafftService crafftService;

    @InjectMocks
    private CrafftController crafftController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. submitCrafft tests ---
    @Test
    void testSubmitCrafft_RegisteredUserSuccess() {
        CrafftSubmissionDTO dto = CrafftSubmissionDTO.builder()
                .username("testUser")
                .question1(1).question2(0).question3(1).question4(0)
                .car("No").relax("Yes").alone("No").forget("Yes").family("No").trouble("No")
                .build();

        UUID resultId = UUID.randomUUID();
        AssessmentResult mockResult = AssessmentResult.builder()
                .assessmentResultID(resultId)
                .score(2)
                .riskLevel(RiskLevel.LOW)
                .suggestedAction("Monitor usage.")
                .completedTime(LocalDateTime.now())
                .build();

        when(crafftService.processCrafftSubmission(dto)).thenReturn(mockResult);

        ResponseEntity<?> responseEntity = crafftController.submitCrafft(dto);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(((Map<String, ?>) responseEntity.getBody()).containsKey("resultId"));
        assertEquals(resultId, ((Map<String, ?>) responseEntity.getBody()).get("resultId"));
        verify(crafftService).processCrafftSubmission(dto);
    }

    @Test
    void testSubmitCrafft_GuestUserSuccess() {
        CrafftSubmissionDTO dto = CrafftSubmissionDTO.builder()
                .username(null) // Guest user
                .question1(0).question2(0).question3(0).question4(0)
                .car("No").relax("No").alone("No").forget("No").family("No").trouble("No")
                .build();

        AssessmentResult mockResult = AssessmentResult.builder()
                .assessmentResultID(null) // Indicates guest submission
                .score(0)
                .riskLevel(RiskLevel.NORMAL)
                .suggestedAction("No action needed.")
                .completedTime(LocalDateTime.now())
                .build();

        when(crafftService.processCrafftSubmission(dto)).thenReturn(mockResult);

        ResponseEntity<?> responseEntity = crafftController.submitCrafft(dto);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(((Map<String, ?>) responseEntity.getBody()).containsKey("temp"));
        assertTrue((Boolean) ((Map<String, ?>) responseEntity.getBody()).get("temp"));
        assertEquals(0, ((Map<String, ?>) responseEntity.getBody()).get("score"));
        assertEquals(RiskLevel.NORMAL, ((Map<String, ?>) responseEntity.getBody()).get("riskLevel"));
        verify(crafftService).processCrafftSubmission(dto);
    }

    @Test
    void testSubmitCrafft_InvalidInput_MissingRequiredFields() {
        // Missing crucial fields or invalid enum values would ideally be caught by @Valid
        // Here, we simulate the service throwing an exception due to invalid data
        CrafftSubmissionDTO invalidDto = CrafftSubmissionDTO.builder()
                .username("testUser")
                .question1(-1) // Invalid value
                .car("InvalidOption") // Invalid value
                .build();

        when(crafftService.processCrafftSubmission(invalidDto))
                .thenThrow(new IllegalArgumentException("Invalid input data for CRAFFT questions"));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> crafftController.submitCrafft(invalidDto));
        assertTrue(exception.getMessage().contains("Invalid input data"));
        verify(crafftService).processCrafftSubmission(invalidDto);
    }

    @Test
    void testSubmitCrafft_ServiceThrowsException() {
        CrafftSubmissionDTO dto = CrafftSubmissionDTO.builder()
                .username("testUser")
                .question1(1).question2(0).question3(1).question4(0)
                .car("No").relax("Yes").alone("No").forget("Yes").family("No").trouble("No")
                .build();

        when(crafftService.processCrafftSubmission(dto)).thenThrow(new RuntimeException("Database error during submission"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> crafftController.submitCrafft(dto));
        assertTrue(exception.getMessage().contains("Database error"));
        verify(crafftService).processCrafftSubmission(dto);
    }

    @Test
    void testSubmitCrafft_NegativeScoreReturned() {
        // This test case is more for defensive programming or if scoring logic changes.
        // Assuming CRAFFT score won't be negative in a real scenario.
        CrafftSubmissionDTO dto = CrafftSubmissionDTO.builder()
                .username("testUser")
                .question1(0).question2(0).question3(0).question4(0)
                .car("No").relax("No").alone("No").forget("No").family("No").trouble("No")
                .build();

        // Simulate a scenario where a bug in service leads to a negative score
        AssessmentResult mockResult = AssessmentResult.builder()
                .assessmentResultID(UUID.randomUUID())
                .score(-1) // Negative score
                .riskLevel(RiskLevel.NORMAL)
                .suggestedAction("Review scoring logic.")
                .completedTime(LocalDateTime.now())
                .build();

        when(crafftService.processCrafftSubmission(dto)).thenReturn(mockResult);

        ResponseEntity<?> responseEntity = crafftController.submitCrafft(dto);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(((Map<String, ?>) responseEntity.getBody()).containsKey("resultId"));
        // The controller successfully returns the resultId even with a 'buggy' score from service
        assertEquals(-1, mockResult.getScore()); // Asserting the mock behavior
        verify(crafftService).processCrafftSubmission(dto);
    }
}