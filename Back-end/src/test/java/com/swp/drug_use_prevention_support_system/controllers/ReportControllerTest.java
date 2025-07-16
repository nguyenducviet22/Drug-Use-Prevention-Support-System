package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.ReportRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ReportResponse;
import com.swp.drug_use_prevention_support_system.services.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. getLineChartData tests ---
    @Test
    void testGetLineChartData_Success() {
        ReportRequest request = new ReportRequest("MONTHLY", "2024-01", "2024-03");
        List<ReportResponse> mockResponses = Arrays.asList(
                ReportResponse.builder().date(LocalDate.of(2024, 1, 1)).month("January").totalMembers(100).build(),
                ReportResponse.builder().date(LocalDate.of(2024, 2, 1)).month("February").totalMembers(120).build(),
                ReportResponse.builder().date(LocalDate.of(2024, 3, 1)).month("March").totalMembers(150).build()
        );
        when(reportService.getLineChartData(request)).thenReturn(mockResponses);

        ResponseEntity<ApiResponse<List<ReportResponse>>> responseEntity = reportController.getLineChartData(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(3, responseEntity.getBody().getData().size());
        assertEquals("January", responseEntity.getBody().getData().get(0).getMonth());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(reportService).getLineChartData(request);
    }

    @Test
    void testGetLineChartData_EmptyResult() {
        ReportRequest request = new ReportRequest("MONTHLY", "2024-01", "2024-03");
        when(reportService.getLineChartData(request)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<ReportResponse>>> responseEntity = reportController.getLineChartData(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(reportService).getLineChartData(request);
    }

    @Test
    void testGetLineChartData_ServiceThrowsException() {
        ReportRequest request = new ReportRequest("YEARLY", "2023-01", "2023-12");
        when(reportService.getLineChartData(request)).thenThrow(new RuntimeException("Database connection error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> reportController.getLineChartData(request));
        assertTrue(exception.getMessage().contains("Database connection error"));
        verify(reportService).getLineChartData(request);
    }

    // --- 2. getStatCardData tests ---
    @Test
    void testGetStatCardData_Success() {
        ReportResponse mockResponse = ReportResponse.builder()
                .totalMembers(500)
                .staffMembers(50)
                .consultants(20)
                .monthlyConsultations(150)
                .activeCourses(10)
                .blogs(30)
                .events(5)
                .courses(20)
                .build();
        when(reportService.getStatCardData()).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<ReportResponse>> responseEntity = reportController.getStatCardData();

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(500, responseEntity.getBody().getData().getTotalMembers());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(reportService).getStatCardData();
    }

    @Test
    void testGetStatCardData_ServiceReturnsNull() {
        when(reportService.getStatCardData()).thenReturn(null);

        ResponseEntity<ApiResponse<ReportResponse>> responseEntity = reportController.getStatCardData();

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertNull(responseEntity.getBody().getData()); // Data should be null
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(reportService).getStatCardData();
    }
}