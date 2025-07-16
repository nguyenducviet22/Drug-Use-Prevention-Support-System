package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.QualificationResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.Degree;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.QualificationService;
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

class QualificationControllerTest {

    @Mock
    private QualificationService qualificationService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private QualificationController qualificationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createQualification tests ---
    @Test
    void testCreateQualification_Success() {
        CreateQualificationRequest request = CreateQualificationRequest.builder()
                .name("Psychology Degree")
                .degree(Degree.BACHELOR)
                .institution("University A")
                .year(2020)
                .build();
        QualificationResponse mockResponse = QualificationResponse.builder()
                .qualificationID(UUID.randomUUID())
                .name("Psychology Degree")
                .status(CourseStatus.AVAILABLE)
                .build();
        when(qualificationService.createQualification(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<QualificationResponse>> response = qualificationController.createQualification(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Psychology Degree", response.getBody().getData().getName());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(qualificationService).createQualification(request);
    }

    @Test
    void testCreateQualification_InvalidInput_NameBlank() {
        CreateQualificationRequest invalidRequest = CreateQualificationRequest.builder()
                .name("") // Blank name
                .degree(Degree.BACHELOR)
                .institution("University A")
                .year(2020)
                .build();
        when(qualificationService.createQualification(invalidRequest))
                .thenThrow(new ConstraintViolationException("Name is required", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> qualificationController.createQualification(invalidRequest));
        verify(qualificationService).createQualification(invalidRequest);
    }

    @Test
    void testCreateQualification_InvalidInput_DegreeNull() {
        CreateQualificationRequest invalidRequest = CreateQualificationRequest.builder()
                .name("Psychology Degree")
                .degree(null) // Null degree
                .institution("University A")
                .year(2020)
                .build();
        when(qualificationService.createQualification(invalidRequest))
                .thenThrow(new ConstraintViolationException("Degree is required", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> qualificationController.createQualification(invalidRequest));
        verify(qualificationService).createQualification(invalidRequest);
    }

    @Test
    void testCreateQualification_InvalidInput_InstitutionBlank() {
        CreateQualificationRequest invalidRequest = CreateQualificationRequest.builder()
                .name("Psychology Degree")
                .degree(Degree.BACHELOR)
                .institution("") // Blank institution
                .year(2020)
                .build();
        when(qualificationService.createQualification(invalidRequest))
                .thenThrow(new ConstraintViolationException("Institution is required", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> qualificationController.createQualification(invalidRequest));
        verify(qualificationService).createQualification(invalidRequest);
    }

    @Test
    void testCreateQualification_InvalidInput_YearInvalid() {
        CreateQualificationRequest invalidRequest = CreateQualificationRequest.builder()
                .name("Psychology Degree")
                .degree(Degree.BACHELOR)
                .institution("University A")
                .year(1899) // Invalid year
                .build();
        when(qualificationService.createQualification(invalidRequest))
                .thenThrow(new ConstraintViolationException("Year must be valid", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> qualificationController.createQualification(invalidRequest));
        verify(qualificationService).createQualification(invalidRequest);
    }


    // --- 2. getAllQualifications tests ---
    @Test
    void testGetAllQualifications_Success() {
        List<QualificationResponse> mockList = Arrays.asList(
                QualificationResponse.builder().qualificationID(UUID.randomUUID()).name("Qual A").build(),
                QualificationResponse.builder().qualificationID(UUID.randomUUID()).name("Qual B").build()
        );
        when(qualificationService.getAllQualifications()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<QualificationResponse>>> response = qualificationController.getAllQualifications();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(qualificationService).getAllQualifications();
    }

    @Test
    void testGetAllQualifications_NoQualificationsFound() {
        when(qualificationService.getAllQualifications()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<QualificationResponse>>> response = qualificationController.getAllQualifications();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(qualificationService).getAllQualifications();
    }

    // --- 3. getConsultantQualifications tests ---
    @Test
    void testGetConsultantQualifications_Success() {
        String username = "consultant1";
        List<QualificationResponse> mockList = Arrays.asList(
                QualificationResponse.builder().qualificationID(UUID.randomUUID()).name("Qual for C1").build(),
                QualificationResponse.builder().qualificationID(UUID.randomUUID()).name("Another Qual for C1").build()
        );
        when(qualificationService.getConsultantQualifications(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<QualificationResponse>>> response = qualificationController.getConsultantQualifications(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(qualificationService).getConsultantQualifications(username);
    }

    @Test
    void testGetConsultantQualifications_NoQualificationsForConsultant() {
        String username = "nonExistentConsultant";
        when(qualificationService.getConsultantQualifications(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<QualificationResponse>>> response = qualificationController.getConsultantQualifications(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(qualificationService).getConsultantQualifications(username);
    }

    // --- 4. getQualification (by ID) tests ---
    @Test
    void testGetQualificationById_Success() {
        UUID id = UUID.randomUUID();
        QualificationResponse mockResponse = QualificationResponse.builder().qualificationID(id).name("Specific Qual").build();
        when(qualificationService.getQualification(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<QualificationResponse>> response = qualificationController.getQualification(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getQualificationID());
        verify(qualificationService).getQualification(id);
    }

    @Test
    void testGetQualificationById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(qualificationService.getQualification(nonExistentId)).thenThrow(new NoSuchElementException("Qualification not found by ID"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> qualificationController.getQualification(nonExistentId));
        assertTrue(exception.getMessage().contains("Qualification not found by ID"));
        verify(qualificationService).getQualification(nonExistentId);
    }

    // --- 5. updateQualification tests ---
    @Test
    void testUpdateQualification_Success() {
        UUID id = UUID.randomUUID();
        UpdateQualificationRequest request = UpdateQualificationRequest.builder()
                .name("Updated Qualification")
                .degree(Degree.MASTER)
                .institution("Updated University")
                .year(2022)
                .build();
        QualificationResponse updatedResponse = QualificationResponse.builder()
                .qualificationID(id)
                .name("Updated Qualification")
                .degree(Degree.MASTER)
                .build();
        when(qualificationService.updateQualification(id, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<QualificationResponse>> response = qualificationController.updateQualification(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Qualification", response.getBody().getData().getName());
        assertEquals(Degree.MASTER, response.getBody().getData().getDegree());
        verify(qualificationService).updateQualification(id, request);
    }

    @Test
    void testUpdateQualification_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateQualificationRequest request = UpdateQualificationRequest.builder()
                .name("Update Attempt")
                .degree(Degree.DOCTORAL)
                .institution("Some Uni")
                .year(2023)
                .build();
        when(qualificationService.updateQualification(nonExistentId, request)).thenThrow(new NoSuchElementException("Qualification to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> qualificationController.updateQualification(nonExistentId, request));
        assertTrue(exception.getMessage().contains("Qualification to update not found"));
        verify(qualificationService).updateQualification(nonExistentId, request);
    }

    @Test
    void testUpdateQualification_InvalidInput_NameBlank() {
        UUID id = UUID.randomUUID();
        UpdateQualificationRequest invalidRequest = UpdateQualificationRequest.builder()
                .name("") // Blank name
                .degree(Degree.BACHELOR)
                .institution("University A")
                .year(2020)
                .build();
        when(qualificationService.updateQualification(id, invalidRequest))
                .thenThrow(new ConstraintViolationException("Name is required", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> qualificationController.updateQualification(id, invalidRequest));
        verify(qualificationService).updateQualification(id, invalidRequest);
    }

    @Test
    void testUpdateQualification_InvalidInput_YearInvalid() {
        UUID id = UUID.randomUUID();
        UpdateQualificationRequest invalidRequest = UpdateQualificationRequest.builder()
                .name("Valid Name")
                .degree(Degree.BACHELOR)
                .institution("University A")
                .year(1800) // Invalid year
                .build();
        when(qualificationService.updateQualification(id, invalidRequest))
                .thenThrow(new ConstraintViolationException("Year must be valid", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> qualificationController.updateQualification(id, invalidRequest));
        verify(qualificationService).updateQualification(id, invalidRequest);
    }

    // --- 6. deleteQualification tests ---
    @Test
    void testDeleteQualification_Success() {
        UUID id = UUID.randomUUID();
        QualificationResponse mockResponse = QualificationResponse.builder()
                .qualificationID(id)
                .name("Deleted Qual")
                .status(CourseStatus.UNAVAILABLE) // Assuming delete sets status to INACTIVE
                .build();
        when(qualificationService.deleteQualification(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<QualificationResponse>> response = qualificationController.deleteQualification(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(CourseStatus.UNAVAILABLE, response.getBody().getData().getStatus());
        verify(qualificationService).deleteQualification(id);
    }

    @Test
    void testDeleteQualification_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(qualificationService.deleteQualification(nonExistentId)).thenThrow(new NoSuchElementException("Qualification to delete not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> qualificationController.deleteQualification(nonExistentId));
        assertTrue(exception.getMessage().contains("Qualification to delete not found"));
        verify(qualificationService).deleteQualification(nonExistentId);
    }

    // --- 7. importUserDetails (importQualifications) tests ---
    @Test
    void testImportQualifications_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importQualificationsFromExcel(any(InputStream.class));

        ResponseEntity<String> response = qualificationController.importUserDetails(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Qualifications into DB", response.getBody());
        verify(excelService).importQualificationsFromExcel(mockInputStream);
    }

    @Test
    void testImportQualifications_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = qualificationController.importUserDetails(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportQualifications_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> qualificationController.importUserDetails(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 8. getAllQualificationDegrees tests ---
    @Test
    void testGetAllQualificationDegrees_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = qualificationController.getAllQualificationDegrees();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> degrees = response.getBody().getData();
        assertEquals(Degree.values().length, degrees.size());
        assertTrue(degrees.contains(Degree.CERTIFICATION.name()));
        assertTrue(degrees.contains(Degree.ASSOCIATE.name()));
        assertTrue(degrees.contains(Degree.BACHELOR.name()));
        assertTrue(degrees.contains(Degree.MASTER.name()));
        assertTrue(degrees.contains(Degree.DOCTORAL.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 9. getAllQualificationStatuses tests ---
    @Test
    void testGetAllQualificationStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = qualificationController.getAllQualificationStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(CourseStatus.values().length, statuses.size());
        assertTrue(statuses.contains(CourseStatus.AVAILABLE.name()));
        assertTrue(statuses.contains(CourseStatus.UNAVAILABLE.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }
}