package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResultResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.services.AssessmentResultService;
import com.swp.drug_use_prevention_support_system.services.ExcelService; // Although not used in controller, keep for consistency if it's a common dependency
import com.swp.drug_use_prevention_support_system.services.GoogleSheetsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssessmentResultControllerTest {

    @Mock
    private AssessmentResultService assessmentResultService;

    @Mock
    private GoogleSheetsService googleSheetsService;

    @InjectMocks
    private AssessmentResultController assessmentResultController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. getAssessmentResults tests ---
    @Test
    void testGetAssessmentResults_Success() {
        List<AssessmentResultResponse> mockList = Arrays.asList(
                AssessmentResultResponse.builder().assessmentResultID(UUID.randomUUID()).riskLevel(RiskLevel.LOW).score(0).build(),
                AssessmentResultResponse.builder().assessmentResultID(UUID.randomUUID()).riskLevel(RiskLevel.NORMAL).score(1).build(),
                AssessmentResultResponse.builder().assessmentResultID(UUID.randomUUID()).riskLevel(RiskLevel.HIGH).score(2).build()
        );
        when(assessmentResultService.getAllAssessmentResults()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AssessmentResultResponse>>> response = assessmentResultController.getAssessmentResults();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentResultService).getAllAssessmentResults();
    }

    @Test
    void testGetAssessmentResults_NoResultsFound() {
        when(assessmentResultService.getAllAssessmentResults()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AssessmentResultResponse>>> response = assessmentResultController.getAssessmentResults();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentResultService).getAllAssessmentResults();
    }

    // --- 2. getMyAssessments tests ---
    @Test
    void testGetMyAssessments_Success() {
        String username = "testUser";
        List<AssessmentResultResponse> mockList = Arrays.asList(
                AssessmentResultResponse.builder().assessmentResultID(UUID.randomUUID()).riskLevel(RiskLevel.LOW).build(),
                AssessmentResultResponse.builder().assessmentResultID(UUID.randomUUID()).riskLevel(RiskLevel.HIGH).build()
        );
        when(assessmentResultService.getUserAssessmentResults(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AssessmentResultResponse>>> response = assessmentResultController.getMyAssessments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentResultService).getUserAssessmentResults(username);
    }

    @Test
    void testGetMyAssessments_NoResultsForUser() {
        String username = "noResultsUser";
        when(assessmentResultService.getUserAssessmentResults(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AssessmentResultResponse>>> response = assessmentResultController.getMyAssessments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentResultService).getUserAssessmentResults(username);
    }

    @Test
    void testGetMyAssessments_UserNotFound() {
        String nonExistentUsername = "nonExistent";
        when(assessmentResultService.getUserAssessmentResults(nonExistentUsername)).thenThrow(new NoSuchElementException("User not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> assessmentResultController.getMyAssessments(nonExistentUsername));
        assertTrue(exception.getMessage().contains("User not found"));
        verify(assessmentResultService).getUserAssessmentResults(nonExistentUsername);
    }

    // --- 3. getAssessment (by ID) tests ---
    @Test
    void testGetAssessmentById_Success() {
        UUID id = UUID.randomUUID();
        AssessmentResultResponse mockResponse = AssessmentResultResponse.builder().assessmentResultID(id).riskLevel(RiskLevel.NORMAL).build();
        when(assessmentResultService.getAssessmentResult(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AssessmentResultResponse>> response = assessmentResultController.getAssessment(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getAssessmentResultID());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentResultService).getAssessmentResult(id);
    }

    @Test
    void testGetAssessmentById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(assessmentResultService.getAssessmentResult(nonExistentId)).thenThrow(new NoSuchElementException("Assessment Result not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> assessmentResultController.getAssessment(nonExistentId));
        assertTrue(exception.getMessage().contains("Assessment Result not found"));
        verify(assessmentResultService).getAssessmentResult(nonExistentId);
    }

    // --- 4. getAllAssessmentRiskLevel tests ---
    @Test
    void testGetAllAssessmentRiskLevel_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = assessmentResultController.getAllAssessmentRiskLevel();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> levels = response.getBody().getData();
        assertEquals(RiskLevel.values().length, levels.size());
        assertTrue(levels.contains(RiskLevel.LOW.name()));
        assertTrue(levels.contains(RiskLevel.NORMAL.name()));
        assertTrue(levels.contains(RiskLevel.HIGH.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 5. readFromGGSheet tests ---
    @Test
    void testReadFromGGSheet_Success() throws GeneralSecurityException, IOException {
        doNothing().when(googleSheetsService).importDataFromSheet();

        ResponseEntity<String> response = assessmentResultController.readFromGGSheet();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Google sheet data saved Assessment Results into DB", response.getBody());
        verify(googleSheetsService).importDataFromSheet();
    }

    @Test
    void testReadFromGGSheet_GeneralSecurityException() throws GeneralSecurityException, IOException {
        doThrow(new GeneralSecurityException("Google Sheets security error")).when(googleSheetsService).importDataFromSheet();

        Exception exception = assertThrows(GeneralSecurityException.class, () -> assessmentResultController.readFromGGSheet());
        assertTrue(exception.getMessage().contains("Google Sheets security error"));
        verify(googleSheetsService).importDataFromSheet();
    }

    @Test
    void testReadFromGGSheet_IOException() throws GeneralSecurityException, IOException {
        doThrow(new IOException("Google Sheets IO error")).when(googleSheetsService).importDataFromSheet();

        Exception exception = assertThrows(IOException.class, () -> assessmentResultController.readFromGGSheet());
        assertTrue(exception.getMessage().contains("Google Sheets IO error"));
        verify(googleSheetsService).importDataFromSheet();
    }
}