package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EnrollmentResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import com.swp.drug_use_prevention_support_system.services.EnrollmentService;
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

class EnrollmentControllerTest {

    @Mock
    private EnrollmentService enrollmentService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private EnrollmentController enrollmentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createEnrollment tests ---
    @Test
    void testCreateEnrollment_Success() {
        CreateEnrollmentRequest request = CreateEnrollmentRequest.builder()
                .courseID(UUID.randomUUID())
                .build();
        EnrollmentResponse mockResponse = EnrollmentResponse.builder()
                .enrollmentID(UUID.randomUUID())
                .status(EnrollmentStatus.LEARNING)
                .build();
        when(enrollmentService.createEnrollment(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.createEnrollment(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(EnrollmentStatus.LEARNING, response.getBody().getData().getStatus());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(enrollmentService).createEnrollment(request);
    }

    @Test
    void testCreateEnrollment_InvalidInput() {
        CreateEnrollmentRequest invalidRequest = CreateEnrollmentRequest.builder()
                .courseID(null) // Invalid: @NotNull
                .build();

        // Simulate validation error from service layer or controller's @Valid
        when(enrollmentService.createEnrollment(invalidRequest)).thenThrow(new ConstraintViolationException("Course ID must not be null", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> enrollmentController.createEnrollment(invalidRequest));
        verify(enrollmentService).createEnrollment(invalidRequest);
    }

    // --- 2. getAllEnrollments tests ---
    @Test
    void testGetAllEnrollments_Success() {
        List<EnrollmentResponse> mockList = Arrays.asList(
                EnrollmentResponse.builder().enrollmentID(UUID.randomUUID()).status(EnrollmentStatus.LEARNING).build(),
                EnrollmentResponse.builder().enrollmentID(UUID.randomUUID()).status(EnrollmentStatus.COMPLETED).build()
        );
        when(enrollmentService.getAllEnrollments()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EnrollmentResponse>>> response = enrollmentController.getAllEnrollments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(enrollmentService).getAllEnrollments();
    }

    @Test
    void testGetAllEnrollments_NoEnrollmentsFound() {
        when(enrollmentService.getAllEnrollments()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EnrollmentResponse>>> response = enrollmentController.getAllEnrollments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(enrollmentService).getAllEnrollments();
    }

    // --- 3. getMemberEnrollments tests ---
    @Test
    void testGetMemberEnrollments_Success() {
        String username = "memberUser";
        List<EnrollmentResponse> mockList = Arrays.asList(
                EnrollmentResponse.builder().enrollmentID(UUID.randomUUID()).status(EnrollmentStatus.LEARNING).build(),
                EnrollmentResponse.builder().enrollmentID(UUID.randomUUID()).status(EnrollmentStatus.COMPLETED).build()
        );
        when(enrollmentService.getMemberEnrollments(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EnrollmentResponse>>> response = enrollmentController.getMemberEnrollments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(enrollmentService).getMemberEnrollments(username);
    }

    @Test
    void testGetMemberEnrollments_NoEnrollmentsForMember() {
        String username = "memberUser";
        when(enrollmentService.getMemberEnrollments(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EnrollmentResponse>>> response = enrollmentController.getMemberEnrollments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(enrollmentService).getMemberEnrollments(username);
    }

    // --- 4. getCourseEnrollments tests ---
    @Test
    void testGetCourseEnrollments_Success() {
        UUID courseId = UUID.randomUUID();
        List<EnrollmentResponse> mockList = Arrays.asList(
                EnrollmentResponse.builder().enrollmentID(UUID.randomUUID()).status(EnrollmentStatus.LEARNING).build(),
                EnrollmentResponse.builder().enrollmentID(UUID.randomUUID()).status(EnrollmentStatus.COMPLETED).build()
        );
        when(enrollmentService.getCourseEnrollments(courseId)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EnrollmentResponse>>> response = enrollmentController.getCourseEnrollments(courseId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(enrollmentService).getCourseEnrollments(courseId);
    }

    @Test
    void testGetCourseEnrollments_NoEnrollmentsForCourse() {
        UUID courseId = UUID.randomUUID();
        when(enrollmentService.getCourseEnrollments(courseId)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EnrollmentResponse>>> response = enrollmentController.getCourseEnrollments(courseId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(enrollmentService).getCourseEnrollments(courseId);
    }

    // --- 5. getEnrollment (by ID) tests ---
    @Test
    void testGetEnrollmentById_Success() {
        UUID id = UUID.randomUUID();
        EnrollmentResponse mockResponse = EnrollmentResponse.builder().enrollmentID(id).status(EnrollmentStatus.LEARNING).build();
        when(enrollmentService.getEnrollment(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.getEnrollment(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getEnrollmentID());
        verify(enrollmentService).getEnrollment(id);
    }

    @Test
    void testGetEnrollmentById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(enrollmentService.getEnrollment(nonExistentId)).thenThrow(new NoSuchElementException("Enrollment not found by ID"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> enrollmentController.getEnrollment(nonExistentId));
        assertTrue(exception.getMessage().contains("Enrollment not found by ID"));
        verify(enrollmentService).getEnrollment(nonExistentId);
    }

    // --- 6. getEnrollment (by Course ID and Username) tests ---
    @Test
    void testGetEnrollmentByCourseIdAndUsername_Success() {
        UUID courseId = UUID.randomUUID();
        String username = "testUser";
        EnrollmentResponse mockResponse = EnrollmentResponse.builder().enrollmentID(UUID.randomUUID()).status(EnrollmentStatus.LEARNING).build();
        when(enrollmentService.getEnrollmentByUsernameAndCourseID(courseId, username)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.getEnrollment(courseId, username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(enrollmentService).getEnrollmentByUsernameAndCourseID(courseId, username);
    }

    @Test
    void testGetEnrollmentByCourseIdAndUsername_NotFound() {
        UUID courseId = UUID.randomUUID();
        String username = "nonExistentUser";
        when(enrollmentService.getEnrollmentByUsernameAndCourseID(courseId, username)).thenThrow(new NoSuchElementException("Enrollment not found for user and course"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> enrollmentController.getEnrollment(courseId, username));
        assertTrue(exception.getMessage().contains("Enrollment not found for user and course"));
        verify(enrollmentService).getEnrollmentByUsernameAndCourseID(courseId, username);
    }

    // --- 7. updateEnrollmentStatus tests ---
    @Test
    void testUpdateEnrollmentStatus_Success() {
        UUID id = UUID.randomUUID();
        EnrollmentStatus newStatus = EnrollmentStatus.COMPLETED;
        EnrollmentResponse updatedResponse = EnrollmentResponse.builder().enrollmentID(id).status(newStatus).build();
        when(enrollmentService.updateEnrollmentStatus(id, newStatus)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.updateEnrollmentStatus(id, newStatus);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(newStatus, response.getBody().getData().getStatus());
        verify(enrollmentService).updateEnrollmentStatus(id, newStatus);
    }

    @Test
    void testUpdateEnrollmentStatus_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        EnrollmentStatus newStatus = EnrollmentStatus.CANCELED;
        when(enrollmentService.updateEnrollmentStatus(nonExistentId, newStatus)).thenThrow(new NoSuchElementException("Enrollment to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> enrollmentController.updateEnrollmentStatus(nonExistentId, newStatus));
        assertTrue(exception.getMessage().contains("Enrollment to update not found"));
        verify(enrollmentService).updateEnrollmentStatus(nonExistentId, newStatus);
    }

    // --- 8. importEnrollments tests ---
    @Test
    void testImportEnrollments_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importEnrollmentsFromExcel(any(InputStream.class));

        ResponseEntity<String> response = enrollmentController.importEnrollments(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Enrollments into DB", response.getBody());
        verify(excelService).importEnrollmentsFromExcel(mockInputStream);
    }

    @Test
    void testImportEnrollments_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = enrollmentController.importEnrollments(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportEnrollments_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> enrollmentController.importEnrollments(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 9. getAllEnrollmentStatuses tests ---
    @Test
    void testGetAllEnrollmentStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = enrollmentController.getAllEnrollmentStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(EnrollmentStatus.values().length, statuses.size());
        assertTrue(statuses.contains(EnrollmentStatus.LEARNING.name()));
        assertTrue(statuses.contains(EnrollmentStatus.NOT_STARTED.name()));
        assertTrue(statuses.contains(EnrollmentStatus.COMPLETED.name()));
        assertTrue(statuses.contains(EnrollmentStatus.CANCELED.name()));
        assertTrue(statuses.contains(EnrollmentStatus.EXPIRED.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }
}