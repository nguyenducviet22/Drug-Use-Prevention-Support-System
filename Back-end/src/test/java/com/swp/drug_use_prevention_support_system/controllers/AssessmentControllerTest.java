package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.services.AssessmentService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssessmentControllerTest {

    @Mock
    private AssessmentService assessmentService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private AssessmentController assessmentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createAssessment tests ---
    @Test
    void testCreateAssessment_Success() {
        CreateAssessmentRequest request = CreateAssessmentRequest.builder()
                .image("image_url")
                .assessmentType(AssessmentType.CRAFFT)
                .linkTest("http://example.com/test")
                .description("Initial assessment description")
                .details("Some details about the initial assessment")
                .build();
        AssessmentResponse mockResponse = AssessmentResponse.builder()
                .assessmentID(UUID.randomUUID())
                .assessmentType(AssessmentType.CRAFFT)
                .linkTest("http://example.com/test")
                .build();
        when(assessmentService.createAssessment(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AssessmentResponse>> response = assessmentController.createAssessment(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(AssessmentType.CRAFFT, response.getBody().getData().getAssessmentType());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(assessmentService).createAssessment(request);
    }

    @Test
    void testCreateAssessment_InvalidInput() {
        CreateAssessmentRequest invalidRequest = CreateAssessmentRequest.builder()
                .image("image_url")
                .assessmentType(null) // Invalid: @NotBlank
                .linkTest("") // Invalid: @NotBlank
                .description("Valid description")
                .build();

        when(assessmentService.createAssessment(invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> assessmentController.createAssessment(invalidRequest));
        verify(assessmentService).createAssessment(invalidRequest);
    }

    // --- 2. getAssessments tests ---
    @Test
    void testGetAssessments_Success() {
        List<AssessmentResponse> mockList = Arrays.asList(
                AssessmentResponse.builder().assessmentID(UUID.randomUUID()).assessmentType(AssessmentType.CRAFFT).build(),
                AssessmentResponse.builder().assessmentID(UUID.randomUUID()).assessmentType(AssessmentType.ASSIST).build()
        );
        when(assessmentService.getAllAssessments()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AssessmentResponse>>> response = assessmentController.getAssessments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentService).getAllAssessments();
    }

    @Test
    void testGetAssessments_NoAssessmentsFound() {
        when(assessmentService.getAllAssessments()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AssessmentResponse>>> response = assessmentController.getAssessments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentService).getAllAssessments();
    }

    // --- 3. getAssessment (by ID) tests ---
    @Test
    void testGetAssessmentById_Success() {
        UUID id = UUID.randomUUID();
        AssessmentResponse mockResponse = AssessmentResponse.builder().assessmentID(id).assessmentType(AssessmentType.ASSIST).build();
        when(assessmentService.getAssessment(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AssessmentResponse>> response = assessmentController.getAssessment(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getAssessmentID());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentService).getAssessment(id);
    }

    @Test
    void testGetAssessmentById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(assessmentService.getAssessment(nonExistentId)).thenThrow(new NoSuchElementException("Assessment not found by ID"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> assessmentController.getAssessment(nonExistentId));
        assertTrue(exception.getMessage().contains("Assessment not found by ID"));
        verify(assessmentService).getAssessment(nonExistentId);
    }

    // --- 4. getAssessment (by Type) tests ---
    @Test
    void testGetAssessmentByType_Success() {
        AssessmentType type = AssessmentType.CRAFFT;
        AssessmentResponse mockResponse = AssessmentResponse.builder().assessmentID(UUID.randomUUID()).assessmentType(type).build();
        when(assessmentService.getAssessmentByType(type)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AssessmentResponse>> response = assessmentController.getAssessment(type);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(type, response.getBody().getData().getAssessmentType());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(assessmentService).getAssessmentByType(type);
    }

    @Test
    void testGetAssessmentByType_NotFound() {
        AssessmentType nonExistentType = AssessmentType.ASSIST; // Assuming no INITIAL assessment exists for this test case
        when(assessmentService.getAssessmentByType(nonExistentType)).thenThrow(new NoSuchElementException("Assessment not found by Type"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> assessmentController.getAssessment(nonExistentType));
        assertTrue(exception.getMessage().contains("Assessment not found by Type"));
        verify(assessmentService).getAssessmentByType(nonExistentType);
    }

    // --- 5. updateAssessment tests ---
    @Test
    void testUpdateAssessment_Success() {
        UUID id = UUID.randomUUID();
        UpdateAssessmentRequest request = UpdateAssessmentRequest.builder()
                .image("updated_image_url")
                .assessmentType(AssessmentType.ASSIST)
                .linkTest("http://updated.com/test")
                .description("Updated description")
                .details("Updated details")
                .build();
        AssessmentResponse updatedResponse = AssessmentResponse.builder()
                .assessmentID(id)
                .assessmentType(AssessmentType.ASSIST)
                .linkTest("http://updated.com/test")
                .build();
        when(assessmentService.updateAssessment(id, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<AssessmentResponse>> response = assessmentController.updateAssessment(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(AssessmentType.ASSIST, response.getBody().getData().getAssessmentType());
        verify(assessmentService).updateAssessment(id, request);
    }

    @Test
    void testUpdateAssessment_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateAssessmentRequest request = UpdateAssessmentRequest.builder()
                .assessmentType(AssessmentType.ASSIST)
                .linkTest("http://test.com")
                .description("desc")
                .build();
        when(assessmentService.updateAssessment(nonExistentId, request)).thenThrow(new NoSuchElementException("Assessment to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> assessmentController.updateAssessment(nonExistentId, request));
        assertTrue(exception.getMessage().contains("Assessment to update not found"));
        verify(assessmentService).updateAssessment(nonExistentId, request);
    }

    @Test
    void testUpdateAssessment_InvalidInput() {
        UUID id = UUID.randomUUID();
        UpdateAssessmentRequest invalidRequest = UpdateAssessmentRequest.builder()
                .assessmentType(AssessmentType.ASSIST)
                .linkTest("") // Invalid: @NotBlank
                .description("Valid description")
                .build();

        when(assessmentService.updateAssessment(id, invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> assessmentController.updateAssessment(id, invalidRequest));
        verify(assessmentService).updateAssessment(id, invalidRequest);
    }

    // --- 6. updateAssessmentStatus tests ---
    @Test
    void testUpdateAssessmentStatus_Success() {
        UUID id = UUID.randomUUID();
        CourseStatus status = CourseStatus.UNAVAILABLE;
        doNothing().when(assessmentService).updateAssessmentStatus(id, status);

        ResponseEntity<ApiResponse<Void>> response = assessmentController.updateAssessmentStatus(id, status);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody()); // No content body
        verify(assessmentService).updateAssessmentStatus(id, status);
    }

    @Test
    void testUpdateAssessmentStatus_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        CourseStatus status = CourseStatus.AVAILABLE;
        doThrow(new NoSuchElementException("Assessment not found for status update")).when(assessmentService).updateAssessmentStatus(nonExistentId, status);

        Exception exception = assertThrows(NoSuchElementException.class, () -> assessmentController.updateAssessmentStatus(nonExistentId, status));
        assertTrue(exception.getMessage().contains("Assessment not found for status update"));
        verify(assessmentService).updateAssessmentStatus(nonExistentId, status);
    }

    // --- 7. importAssessments tests ---
    @Test
    void testImportAssessments_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importAssessmentsFromExcel(any(InputStream.class));

        ResponseEntity<String> response = assessmentController.importAssessments(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Assessments into DB", response.getBody());
        verify(excelService).importAssessmentsFromExcel(mockInputStream);
    }

    @Test
    void testImportAssessments_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = assessmentController.importAssessments(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportAssessments_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> assessmentController.importAssessments(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 8. getAllAssessmentStatuses tests ---
    @Test
    void testGetAllAssessmentStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = assessmentController.getAllAssessmentStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(CourseStatus.values().length, statuses.size());
        assertTrue(statuses.contains(CourseStatus.AVAILABLE.name()));
        assertTrue(statuses.contains(CourseStatus.UNAVAILABLE.name()));
        assertTrue(statuses.contains(CourseStatus.PENDING.name()));
        assertTrue(statuses.contains(CourseStatus.REJECTED.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }
}