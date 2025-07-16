package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteModulesRequest; // Assuming this DTO exists
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.LessonService;
import com.swp.drug_use_prevention_support_system.services.ModuleService;
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

class ModuleControllerTest {

    @Mock
    private ModuleService moduleService;

    @Mock
    private LessonService lessonService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private ModuleController moduleController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createModule tests ---
    @Test
    void testCreateModule_Success() {
        CreateModuleRequest request = CreateModuleRequest.builder()
                .moduleName("Introduction to APIs")
                .courseID(UUID.randomUUID())
                .build();
        ModuleResponse mockResponse = ModuleResponse.builder()
                .moduleID(UUID.randomUUID())
                .moduleName("Introduction to APIs")
                .status(CourseStatus.AVAILABLE)
                .build();
        when(moduleService.createModule(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<ModuleResponse>> response = moduleController.createModule(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Introduction to APIs", response.getBody().getData().getModuleName());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(moduleService).createModule(request);
    }

    @Test
    void testCreateModule_InvalidInput() {
        // Test with blank module name
        CreateModuleRequest invalidRequestBlankName = CreateModuleRequest.builder()
                .moduleName("")
                .courseID(UUID.randomUUID())
                .build();
        when(moduleService.createModule(invalidRequestBlankName))
                .thenThrow(new ConstraintViolationException("Module name must not be blank", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> moduleController.createModule(invalidRequestBlankName));
        verify(moduleService).createModule(invalidRequestBlankName);

        // Test with null course ID
        CreateModuleRequest invalidRequestNullCourseID = CreateModuleRequest.builder()
                .moduleName("Valid Name")
                .courseID(null)
                .build();
        when(moduleService.createModule(invalidRequestNullCourseID))
                .thenThrow(new ConstraintViolationException("Course ID is required", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> moduleController.createModule(invalidRequestNullCourseID));
        verify(moduleService).createModule(invalidRequestNullCourseID);

        // Test with module name too long
        String longName = "a".repeat(256);
        CreateModuleRequest invalidRequestTooLongName = CreateModuleRequest.builder()
                .moduleName(longName)
                .courseID(UUID.randomUUID())
                .build();
        when(moduleService.createModule(invalidRequestTooLongName))
                .thenThrow(new ConstraintViolationException("Module name must be at most 255 characters", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> moduleController.createModule(invalidRequestTooLongName));
        verify(moduleService).createModule(invalidRequestTooLongName);
    }


    // --- 2. getModule tests ---
    @Test
    void testGetModuleById_Success() {
        UUID id = UUID.randomUUID();
        ModuleResponse mockResponse = ModuleResponse.builder().moduleID(id).moduleName("Sample Module").build();
        when(moduleService.getModel(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<ModuleResponse>> response = moduleController.getModule(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getModuleID());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(moduleService).getModel(id);
    }

    @Test
    void testGetModuleById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(moduleService.getModel(nonExistentId)).thenThrow(new NoSuchElementException("Module not found by ID"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> moduleController.getModule(nonExistentId));
        assertTrue(exception.getMessage().contains("Module not found by ID"));
        verify(moduleService).getModel(nonExistentId);
    }

    // --- 3. getAllLessonByModuleID tests ---
    @Test
    void testGetAllLessonByModuleID_Success() {
        UUID moduleID = UUID.randomUUID();
        List<LessonResponse> mockList = Arrays.asList(
                LessonResponse.builder().lessonID(UUID.randomUUID()).lessonName("Lesson 1").build(),
                LessonResponse.builder().lessonID(UUID.randomUUID()).lessonName("Lesson 2").build()
        );
        when(lessonService.getLessonsForModule(moduleID)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<LessonResponse>>> response = moduleController.getAllLessonByModuleID(moduleID);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(lessonService).getLessonsForModule(moduleID);
    }

    @Test
    void testGetAllLessonByModuleID_NoLessonsFound() {
        UUID moduleID = UUID.randomUUID();
        when(lessonService.getLessonsForModule(moduleID)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<LessonResponse>>> response = moduleController.getAllLessonByModuleID(moduleID);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(lessonService).getLessonsForModule(moduleID);
    }

    // --- 4. importCourses (importModules) tests ---
    @Test
    void testImportModules_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importModulesFromExcel(any(InputStream.class));

        ResponseEntity<String> response = moduleController.importCourses(mockFile); // Method name is importCourses

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Modules into DB", response.getBody());
        verify(excelService).importModulesFromExcel(mockInputStream);
    }

    @Test
    void testImportModules_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = moduleController.importCourses(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportModules_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> moduleController.importCourses(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 5. updateModule tests ---
    @Test
    void testUpdateModule_Success() {
        UUID id = UUID.randomUUID();
        UpdateModuleRequest request = UpdateModuleRequest.builder()
                .moduleName("Updated Module Name")
                .build();
        ModuleResponse updatedResponse = ModuleResponse.builder()
                .moduleID(id)
                .moduleName("Updated Module Name")
                .build();
        when(moduleService.updateModule(id, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<ModuleResponse>> response = moduleController.updateModule(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Module Name", response.getBody().getData().getModuleName());
        verify(moduleService).updateModule(id, request);
    }

    @Test
    void testUpdateModule_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateModuleRequest request = UpdateModuleRequest.builder().moduleName("Attempt to Update").build();
        when(moduleService.updateModule(nonExistentId, request)).thenThrow(new NoSuchElementException("Module to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> moduleController.updateModule(nonExistentId, request));
        assertTrue(exception.getMessage().contains("Module to update not found"));
        verify(moduleService).updateModule(nonExistentId, request);
    }

    @Test
    void testUpdateModule_InvalidInput() {
        UUID id = UUID.randomUUID();
        // Test with blank module name
        UpdateModuleRequest invalidRequestBlankName = UpdateModuleRequest.builder().moduleName("").build();
        when(moduleService.updateModule(id, invalidRequestBlankName))
                .thenThrow(new ConstraintViolationException("Module name must not be blank", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> moduleController.updateModule(id, invalidRequestBlankName));
        verify(moduleService).updateModule(id, invalidRequestBlankName);

        // Test with module name too long
        String longName = "c".repeat(256);
        UpdateModuleRequest invalidRequestTooLongName = UpdateModuleRequest.builder().moduleName(longName).build();
        when(moduleService.updateModule(id, invalidRequestTooLongName))
                .thenThrow(new ConstraintViolationException("Module name must be at most 255 characters", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> moduleController.updateModule(id, invalidRequestTooLongName));
        verify(moduleService).updateModule(id, invalidRequestTooLongName);
    }

    // --- 6. updateModulesStatus tests ---
    @Test
    void testUpdateModulesStatus_Success() {
        UUID courseID = UUID.randomUUID();
        DeleteModulesRequest request = new DeleteModulesRequest(); // Assuming this DTO holds module IDs for status update
        request.setModuleIds(Arrays.asList(UUID.randomUUID(), UUID.randomUUID())); // Example
        List<ModuleResponse> mockResponses = Arrays.asList(
                ModuleResponse.builder().moduleID(request.getModuleIds().get(0)).status(CourseStatus.UNAVAILABLE).build(),
                ModuleResponse.builder().moduleID(request.getModuleIds().get(1)).status(CourseStatus.UNAVAILABLE).build()
        );
        when(moduleService.updateModulesStatus(courseID, request)).thenReturn(mockResponses);

        ResponseEntity<ApiResponse<List<ModuleResponse>>> response = moduleController.updateModulesStatus(courseID, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(CourseStatus.UNAVAILABLE, response.getBody().getData().get(0).getStatus());
        verify(moduleService).updateModulesStatus(courseID, request);
    }

    @Test
    void testUpdateModulesStatus_CourseNotFound() {
        UUID nonExistentCourseID = UUID.randomUUID();
        DeleteModulesRequest request = new DeleteModulesRequest();
        request.setModuleIds(Collections.singletonList(UUID.randomUUID())); // Example
        when(moduleService.updateModulesStatus(nonExistentCourseID, request)).thenThrow(new NoSuchElementException("Course not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> moduleController.updateModulesStatus(nonExistentCourseID, request));
        assertTrue(exception.getMessage().contains("Course not found"));
        verify(moduleService).updateModulesStatus(nonExistentCourseID, request);
    }
}