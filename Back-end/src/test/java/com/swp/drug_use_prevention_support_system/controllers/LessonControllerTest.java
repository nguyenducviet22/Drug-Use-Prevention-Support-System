package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteLessonsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.LessonService;
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

class LessonControllerTest {

    @Mock
    private LessonService lessonService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private LessonController lessonController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createLesson tests ---
    @Test
    void testCreateLesson_Success() {
        CreateLessonRequest request = CreateLessonRequest.builder()
                .lessonName("Lesson 1")
                .objective("Understand basics")
                .content("Introduction to topic")
                .resource("Link to video")
                .moduleID(UUID.randomUUID())
                .build();
        LessonResponse mockResponse = LessonResponse.builder()
                .lessonID(UUID.randomUUID())
                .lessonName("Lesson 1")
                .status(CourseStatus.AVAILABLE)
                .build();
        when(lessonService.createLesson(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.createLesson(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Lesson 1", response.getBody().getData().getLessonName());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(lessonService).createLesson(request);
    }

    @Test
    void testCreateLesson_InvalidInput() {
        // Missing required fields
        CreateLessonRequest invalidRequest = CreateLessonRequest.builder()
                .lessonName("") // Blank
                .objective("Valid objective")
                .content("Valid content")
                .resource("Valid resource")
                .moduleID(UUID.randomUUID())
                .build();

        when(lessonService.createLesson(invalidRequest)).thenThrow(new ConstraintViolationException("Lesson name ID is required", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> lessonController.createLesson(invalidRequest));
        verify(lessonService).createLesson(invalidRequest);

        // Name too long
        String longName = "a".repeat(256);
        CreateLessonRequest invalidRequestTooLong = CreateLessonRequest.builder()
                .lessonName(longName)
                .objective("Valid objective")
                .content("Valid content")
                .resource("Valid resource")
                .moduleID(UUID.randomUUID())
                .build();
        when(lessonService.createLesson(invalidRequestTooLong)).thenThrow(new ConstraintViolationException("Lesson name ID is required: size must be between 0 and 255", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> lessonController.createLesson(invalidRequestTooLong));
        verify(lessonService, times(2)).createLesson(any(CreateLessonRequest.class)); // Called twice
    }

    // --- 2. getLessons tests ---
    @Test
    void testGetLessons_Success() {
        List<LessonResponse> mockList = Arrays.asList(
                LessonResponse.builder().lessonID(UUID.randomUUID()).lessonName("Lesson A").build(),
                LessonResponse.builder().lessonID(UUID.randomUUID()).lessonName("Lesson B").build()
        );
        when(lessonService.getLessons()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<LessonResponse>>> response = lessonController.getLessons();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(lessonService).getLessons();
    }

    @Test
    void testGetLessons_NoLessonsFound() {
        when(lessonService.getLessons()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<LessonResponse>>> response = lessonController.getLessons();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(lessonService).getLessons();
    }

    // --- 3. getLesson (by ID) tests ---
    @Test
    void testGetLessonById_Success() {
        UUID id = UUID.randomUUID();
        LessonResponse mockResponse = LessonResponse.builder().lessonID(id).lessonName("Specific Lesson").build();
        when(lessonService.getLesson(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.getLesson(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getLessonID());
        verify(lessonService).getLesson(id);
    }

    @Test
    void testGetLessonById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(lessonService.getLesson(nonExistentId)).thenThrow(new NoSuchElementException("Lesson not found by ID"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> lessonController.getLesson(nonExistentId));
        assertTrue(exception.getMessage().contains("Lesson not found by ID"));
        verify(lessonService).getLesson(nonExistentId);
    }

    // --- 4. updateLesson tests ---
    @Test
    void testUpdateLesson_Success() {
        UUID id = UUID.randomUUID();
        UpdateLessonRequest request = UpdateLessonRequest.builder()
                .lessonName("Updated Lesson Name")
                .objective("Updated objective")
                .content("Updated content")
                .resource("Updated resource")
                .build();
        LessonResponse updatedResponse = LessonResponse.builder()
                .lessonID(id)
                .lessonName("Updated Lesson Name")
                .build();
        when(lessonService.updateLesson(id, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.updateLesson(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Lesson Name", response.getBody().getData().getLessonName());
        verify(lessonService).updateLesson(id, request);
    }

    @Test
    void testUpdateLesson_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateLessonRequest request = UpdateLessonRequest.builder()
                .lessonName("Update Attempt")
                .objective("Objective")
                .content("Content")
                .resource("Resource")
                .build();
        when(lessonService.updateLesson(nonExistentId, request)).thenThrow(new NoSuchElementException("Lesson to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> lessonController.updateLesson(nonExistentId, request));
        assertTrue(exception.getMessage().contains("Lesson to update not found"));
        verify(lessonService).updateLesson(nonExistentId, request);
    }

    @Test
    void testUpdateLesson_InvalidInput() {
        UUID id = UUID.randomUUID();
        // Blank lesson name
        UpdateLessonRequest invalidRequest = UpdateLessonRequest.builder()
                .lessonName("")
                .objective("Valid objective")
                .content("Valid content")
                .resource("Valid resource")
                .build();

        when(lessonService.updateLesson(id, invalidRequest)).thenThrow(new ConstraintViolationException("Lesson name ID is required", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> lessonController.updateLesson(id, invalidRequest));
        verify(lessonService).updateLesson(id, invalidRequest);

        // Lesson name too long
        String longName = "b".repeat(256);
        UpdateLessonRequest invalidRequestTooLong = UpdateLessonRequest.builder()
                .lessonName(longName)
                .objective("Valid objective")
                .content("Valid content")
                .resource("Valid resource")
                .build();
        when(lessonService.updateLesson(id, invalidRequestTooLong)).thenThrow(new ConstraintViolationException("Lesson name ID is required: size must be between 0 and 255", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> lessonController.updateLesson(id, invalidRequestTooLong));
        verify(lessonService, times(2)).updateLesson(eq(id), any(UpdateLessonRequest.class)); // Called twice
    }

    // --- 5. updateModulesStatus tests ---
    @Test
    void testUpdateLessonsStatus_Success() {
        UUID moduleID = UUID.randomUUID();
        DeleteLessonsRequest request = new DeleteLessonsRequest(); // Assuming this DTO holds info for status update
        request.setLessonIds(Arrays.asList(UUID.randomUUID(), UUID.randomUUID())); // Example
        List<LessonResponse> mockResponses = Arrays.asList(
                LessonResponse.builder().lessonID(request.getLessonIds().get(0)).status(CourseStatus.UNAVAILABLE).build(),
                LessonResponse.builder().lessonID(request.getLessonIds().get(1)).status(CourseStatus.UNAVAILABLE).build()
        );
        when(lessonService.updateLessonsStatus(moduleID, request)).thenReturn(mockResponses);

        ResponseEntity<ApiResponse<List<LessonResponse>>> response = lessonController.updateModulesStatus(moduleID, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(CourseStatus.UNAVAILABLE, response.getBody().getData().get(0).getStatus());
        verify(lessonService).updateLessonsStatus(moduleID, request);
    }

    @Test
    void testUpdateLessonsStatus_ModuleNotFound() {
        UUID nonExistentModuleID = UUID.randomUUID();
        DeleteLessonsRequest request = new DeleteLessonsRequest();
        request.setLessonIds(Collections.singletonList(UUID.randomUUID())); // Example
        when(lessonService.updateLessonsStatus(nonExistentModuleID, request)).thenThrow(new NoSuchElementException("Module not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> lessonController.updateModulesStatus(nonExistentModuleID, request));
        assertTrue(exception.getMessage().contains("Module not found"));
        verify(lessonService).updateLessonsStatus(nonExistentModuleID, request);
    }

    // --- 6. importCourses tests ---
    @Test
    void testImportLessons_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importLessonsFromExcel(any(InputStream.class));

        ResponseEntity<String> response = lessonController.importCourses(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Lessons into DB", response.getBody());
        verify(excelService).importLessonsFromExcel(mockInputStream);
    }

    @Test
    void testImportLessons_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = lessonController.importCourses(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportLessons_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> lessonController.importCourses(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }
}