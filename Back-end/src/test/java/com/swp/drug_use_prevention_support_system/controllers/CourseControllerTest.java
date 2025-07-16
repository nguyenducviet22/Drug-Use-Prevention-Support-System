package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CourseResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import com.swp.drug_use_prevention_support_system.services.CourseService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.ModuleService;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CourseControllerTest {

    @Mock
    private CourseService courseService;

    @Mock
    private ExcelService excelService;

    @Mock
    private ModuleService moduleService;

    @InjectMocks
    private CourseController courseController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createCourse tests ---
    @Test
    void testCreateCourse_Success() {
        CreateCourseRequest request = CreateCourseRequest.builder()
                .courseName("New Course")
                .description("Description")
                .build();
        CourseResponse mockResponse = CourseResponse.builder().courseName("New Course").build();
        when(courseService.createCourse(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.createCourse(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("New Course", response.getBody().getData().getCourseName());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(courseService).createCourse(request);
    }

    @Test
    void testCreateCourse_InvalidInput() {
        CreateCourseRequest invalidRequest = CreateCourseRequest.builder()
                .courseName("") // Invalid: should not be blank
                .description(null) // Invalid: should not be null
                .build();

        // Simulate validation error from service layer or controller's @Valid
        when(courseService.createCourse(invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> courseController.createCourse(invalidRequest));
        verify(courseService).createCourse(invalidRequest);
    }

    // --- 2. getAllCourses tests ---
    @Test
    void testGetAllCourses_Success() {
        List<CourseResponse> mockList = Arrays.asList(
                CourseResponse.builder().courseName("Course1").build(),
                CourseResponse.builder().courseName("Course2").build()
        );
        when(courseService.getAllCourses()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getAllCourses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getAllCourses();
    }

    @Test
    void testGetAllCourses_NoCoursesFound() {
        when(courseService.getAllCourses()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getAllCourses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getAllCourses();
    }

    // --- 3. getCourse tests ---
    @Test
    void testGetCourse_Success() {
        UUID courseId = UUID.randomUUID();
        CourseResponse mockResponse = CourseResponse.builder().courseID(courseId).courseName("Specific Course").build();
        when(courseService.getCourse(courseId)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.getCourse(courseId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(courseId, response.getBody().getData().getCourseID());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getCourse(courseId);
    }

    @Test
    void testGetCourse_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(courseService.getCourse(nonExistentId)).thenThrow(new NoSuchElementException("Course not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> courseController.getCourse(nonExistentId));
        assertTrue(exception.getMessage().contains("Course not found"));
        verify(courseService).getCourse(nonExistentId);
    }

    // --- 4. updateCourse tests ---
    @Test
    void testUpdateCourse_Success() {
        UUID courseId = UUID.randomUUID();
        UpdateCourseRequest request = UpdateCourseRequest.builder()
                .courseName("Updated Course")
                .description("Updated Desc")
                .build();
        CourseResponse updatedResponse = CourseResponse.builder().courseID(courseId).courseName("Updated Course").build();
        when(courseService.updateCourse(courseId, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.updateCourse(courseId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Course", response.getBody().getData().getCourseName());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).updateCourse(courseId, request);
    }

    @Test
    void testUpdateCourse_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateCourseRequest request = UpdateCourseRequest.builder()
                .courseName("Updated Course")
                .build();
        when(courseService.updateCourse(nonExistentId, request)).thenThrow(new NoSuchElementException("Course to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> courseController.updateCourse(nonExistentId, request));
        assertTrue(exception.getMessage().contains("Course to update not found"));
        verify(courseService).updateCourse(nonExistentId, request);
    }

    @Test
    void testUpdateCourse_InvalidInput() {
        UUID courseId = UUID.randomUUID();
        UpdateCourseRequest invalidRequest = UpdateCourseRequest.builder()
                .courseName("") // Invalid: should not be blank
                .build();

        when(courseService.updateCourse(courseId, invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> courseController.updateCourse(courseId, invalidRequest));
        verify(courseService).updateCourse(courseId, invalidRequest);
    }

    // --- 5. updateCourseStatus tests ---
    @Test
    void testUpdateCourseStatus_Success() {
        UUID courseId = UUID.randomUUID();
        CourseStatus newStatus = CourseStatus.AVAILABLE;
        CourseResponse updatedResponse = CourseResponse.builder().courseID(courseId).status(newStatus).build();
        when(courseService.updateCourseStatus(courseId, newStatus)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.updateCourseStatus(courseId, newStatus);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(newStatus, response.getBody().getData().getStatus());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).updateCourseStatus(courseId, newStatus);
    }

    @Test
    void testUpdateCourseStatus_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        CourseStatus newStatus = CourseStatus.AVAILABLE;
        when(courseService.updateCourseStatus(nonExistentId, newStatus)).thenThrow(new NoSuchElementException("Course for status update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> courseController.updateCourseStatus(nonExistentId, newStatus));
        assertTrue(exception.getMessage().contains("Course for status update not found"));
        verify(courseService).updateCourseStatus(nonExistentId, newStatus);
    }

    // --- 6. importCourses tests ---
    @Test
    void testImportCourses_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream("test data".getBytes()));

        ResponseEntity<String> response = courseController.importCourses(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Courses into DB", response.getBody());
        verify(excelService).importCoursesFromExcel(any(ByteArrayInputStream.class));
    }

    @Test
    void testImportCourses_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = courseController.importCourses(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportCourses_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated IO error"));

        Exception exception = assertThrows(IOException.class, () -> courseController.importCourses(mockFile));
        assertTrue(exception.getMessage().contains("Simulated IO error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService); // service should not be called if input stream fails
    }

    // --- 7. getAllCourseStatuses tests ---
    @Test
    void testGetAllCourseStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = courseController.getAllCourseStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(CourseStatus.values().length, statuses.size());
        assertTrue(statuses.contains(CourseStatus.AVAILABLE.name()));
        assertTrue(statuses.contains(CourseStatus.PENDING.name()));
        assertTrue(statuses.contains(CourseStatus.UNAVAILABLE.name()));
        assertTrue(statuses.contains(CourseStatus.REJECTED.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 8. getAllCourses (by AgeGroup) tests ---
    @Test
    void testGetAllCoursesByAgeGroup_Success() {
        AgeGroup ageGroup = AgeGroup.ADULT;
        List<CourseResponse> mockList = Arrays.asList(
                CourseResponse.builder().courseName("Adult Course 1").ageGroup(AgeGroup.ADULT).build(),
                CourseResponse.builder().courseName("Everyone Course").ageGroup(AgeGroup.EVERYONE).build() // Should also be included if logic dictates
        );
        when(courseService.getCoursesByAgeGroup(ageGroup)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getAllCourses(ageGroup);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getCoursesByAgeGroup(ageGroup);
    }

    @Test
    void testGetAllCoursesByAgeGroup_NoCoursesFound() {
        AgeGroup ageGroup = AgeGroup.ADOLESCENT;
        when(courseService.getCoursesByAgeGroup(ageGroup)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getAllCourses(ageGroup);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getCoursesByAgeGroup(ageGroup);
    }

    // --- 9. getCoursesForMemberByStatus tests ---
    @Test
    void testGetCoursesForMemberByStatus_Success() {
        EnrollmentStatus status = EnrollmentStatus.LEARNING;
        String username = "testUser";
        List<CourseResponse> mockList = Arrays.asList(
                CourseResponse.builder().courseName("Enrolled Course 1").build(),
                CourseResponse.builder().courseName("Enrolled Course 2").build()
        );
        when(courseService.getCoursesForMemberByStatus(status, username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getCoursesForMemberByStatus(status, username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getCoursesForMemberByStatus(status, username);
    }

    @Test
    void testGetCoursesForMemberByStatus_NoCoursesFound() {
        EnrollmentStatus status = EnrollmentStatus.COMPLETED;
        String username = "anotherUser";
        when(courseService.getCoursesForMemberByStatus(status, username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getCoursesForMemberByStatus(status, username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getCoursesForMemberByStatus(status, username);
    }

    // --- 10. getModulesForCourse tests ---
    @Test
    void testGetModulesForCourse_Success() {
        UUID courseId = UUID.randomUUID();
        List<ModuleResponse> mockModules = Arrays.asList(
                ModuleResponse.builder().moduleName("Module 1").build(),
                ModuleResponse.builder().moduleName("Module 2").build()
        );
        when(moduleService.getAllModulesForCourse(courseId)).thenReturn(mockModules);

        ResponseEntity<ApiResponse<List<ModuleResponse>>> response = courseController.getModulesForCourse(courseId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(moduleService).getAllModulesForCourse(courseId);
    }

    @Test
    void testGetModulesForCourse_NoModulesFound() {
        UUID courseId = UUID.randomUUID();
        when(moduleService.getAllModulesForCourse(courseId)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<ModuleResponse>>> response = courseController.getModulesForCourse(courseId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(moduleService).getAllModulesForCourse(courseId);
    }

    @Test
    void testGetModulesForCourse_CourseNotFound() {
        UUID nonExistentCourseId = UUID.randomUUID();
        when(moduleService.getAllModulesForCourse(nonExistentCourseId)).thenThrow(new NoSuchElementException("Course for modules not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> courseController.getModulesForCourse(nonExistentCourseId));
        assertTrue(exception.getMessage().contains("Course for modules not found"));
        verify(moduleService).getAllModulesForCourse(nonExistentCourseId);
    }

    // --- 11. getCoursesByStatus tests ---
    @Test
    void testGetCoursesByStatus_Success() {
        CourseStatus status = CourseStatus.AVAILABLE;
        List<CourseResponse> mockList = Arrays.asList(
                CourseResponse.builder().courseName("Active Course 1").status(CourseStatus.AVAILABLE).build(),
                CourseResponse.builder().courseName("Active Course 2").status(CourseStatus.AVAILABLE).build()
        );
        when(courseService.getCoursesByStatus(status)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getCoursesByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getCoursesByStatus(status);
    }

    @Test
    void testGetCoursesByStatus_NoCoursesFound() {
        CourseStatus status = CourseStatus.AVAILABLE;
        when(courseService.getCoursesByStatus(status)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.getCoursesByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(courseService).getCoursesByStatus(status);
    }
}