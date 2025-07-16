package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.BlogResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogType;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.services.BlogService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BlogControllerTest {

    @Mock
    private BlogService blogService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private BlogController blogController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createBlog tests ---
    @Test
    void testCreateBlog_Success() {
        CreateBlogRequest request = CreateBlogRequest.builder()
                .blogName("Test Blog")
                .description("Description")
                .content("Some content")
                .blogType(BlogType.PERSONAL)
                .blogStatus(BlogStatus.DRAFT)
                .ageGroup(AgeGroup.ADULT)
                .build();
        BlogResponse mockResponse = BlogResponse.builder().blogName("Test Blog").build();
        when(blogService.createBlog(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<BlogResponse>> response = blogController.createBlog(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test Blog", response.getBody().getData().getBlogName());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(blogService).createBlog(request);
    }

    @Test
    void testCreateBlog_InvalidInput() {
        CreateBlogRequest invalidRequest = CreateBlogRequest.builder()
                .blogName("") // NotBlank violation
                .description(null) // NotNull violation
                .content("") // NotBlank violation
                .blogType(null) // NotNull violation
                .blogStatus(null) // NotNull violation
                .ageGroup(null) // NotNull violation
                .build();

        when(blogService.createBlog(invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> blogController.createBlog(invalidRequest));
        verify(blogService).createBlog(invalidRequest);
    }

    // --- 2. getBlogs tests ---
    @Test
    void testGetAllBlogs_Success() {
        List<BlogResponse> mockList = Arrays.asList(
                BlogResponse.builder().blogName("Blog1").build(),
                BlogResponse.builder().blogName("Blog2").build()
        );
        when(blogService.getAllBlogs()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogs();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(blogService).getAllBlogs();
    }

    @Test
    void testGetAllBlogs_NoBlogsFound() {
        when(blogService.getAllBlogs()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogs();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(blogService).getAllBlogs();
    }

    // --- 3. getBlog tests ---
    @Test
    void testGetBlog_Success() {
        UUID blogId = UUID.randomUUID();
        BlogResponse mockResponse = BlogResponse.builder().blogName("Single Blog").build();
        when(blogService.getBlog(blogId)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<BlogResponse>> response = blogController.getBlog(blogId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Single Blog", response.getBody().getData().getBlogName());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(blogService).getBlog(blogId);
    }

    @Test
    void testGetBlog_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(blogService.getBlog(nonExistentId)).thenThrow(new NoSuchElementException("Blog does not exist"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> blogController.getBlog(nonExistentId));
        assertTrue(exception.getMessage().contains("Blog does not exist"));
        verify(blogService).getBlog(nonExistentId);
    }

    // --- 4. updateBlog tests ---
    @Test
    void testUpdateBlog_Success() {
        UUID blogId = UUID.randomUUID();
        UpdateBlogRequest request = UpdateBlogRequest.builder()
                .blogName("Updated Blog")
                .description("Updated Description")
                .content("Updated Content")
                .blogType(BlogType.NEWS)
                .blogStatus(BlogStatus.PUBLISHED)
                .ageGroup(AgeGroup.ADOLESCENT)
                .build();
        BlogResponse updatedBlog = BlogResponse.builder().blogName("Updated Blog").build();
        when(blogService.updateBlog(blogId, request)).thenReturn(updatedBlog);

        ResponseEntity<ApiResponse<BlogResponse>> response = blogController.updateBlog(blogId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Blog", response.getBody().getData().getBlogName());
        verify(blogService).updateBlog(blogId, request);
    }

    @Test
    void testUpdateBlog_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateBlogRequest updateRequest = UpdateBlogRequest.builder()
                .blogName("Update")
                .description("desc")
                .content("content")
                .blogType(BlogType.PERSONAL)
                .blogStatus(BlogStatus.DRAFT)
                .ageGroup(AgeGroup.ADULT)
                .build();

        when(blogService.updateBlog(nonExistentId, updateRequest)).thenThrow(new NoSuchElementException("Blog does not exist"));

        assertThrows(NoSuchElementException.class, () -> blogController.updateBlog(nonExistentId, updateRequest));
        verify(blogService).updateBlog(nonExistentId, updateRequest);
    }

    @Test
    void testUpdateBlog_InvalidInput() {
        UUID blogId = UUID.randomUUID();
        UpdateBlogRequest invalidRequest = UpdateBlogRequest.builder()
                .blogName("") // NotBlank violation
                .description(null) // NotNull violation
                .content("") // NotBlank violation
                .blogType(null) // NotNull violation
                .blogStatus(null) // NotNull violation
                .ageGroup(null) // NotNull violation
                .build();

        when(blogService.updateBlog(blogId, invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> blogController.updateBlog(blogId, invalidRequest));
        verify(blogService).updateBlog(blogId, invalidRequest);
    }

    // --- 5. updateBlogStatus tests ---
    @Test
    void testUpdateBlogStatus_Success() {
        UUID blogId = UUID.randomUUID();
        BlogStatus newStatus = BlogStatus.PUBLISHED;
        BlogResponse updatedBlog = BlogResponse.builder().blogStatus(newStatus).build();
        when(blogService.updateBlogStatus(blogId, newStatus)).thenReturn(updatedBlog);

        ResponseEntity<ApiResponse<BlogResponse>> response = blogController.updateBlogStatus(blogId, newStatus);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(newStatus, response.getBody().getData().getBlogStatus());
        verify(blogService).updateBlogStatus(blogId, newStatus);
    }

    @Test
    void testUpdateBlogStatus_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        BlogStatus newStatus = BlogStatus.PUBLISHED;
        when(blogService.updateBlogStatus(nonExistentId, newStatus)).thenThrow(new NoSuchElementException("Blog not found for status update"));

        assertThrows(NoSuchElementException.class, () -> blogController.updateBlogStatus(nonExistentId, newStatus));
        verify(blogService).updateBlogStatus(nonExistentId, newStatus);
    }

    // --- 6. importUserDetails tests ---
    @Test
    void testImportBlogs_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy data".getBytes()); // Simulate a file content
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);

        ResponseEntity<String> response = blogController.importUserDetails(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Blogs into DB", response.getBody());
        verify(excelService).importBlogsFromExcel(mockInputStream);
    }

    @Test
    void testImportBlogs_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = blogController.importUserDetails(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportBlogs_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated IO error"));

        Exception exception = assertThrows(IOException.class, () -> blogController.importUserDetails(mockFile));
        assertTrue(exception.getMessage().contains("Simulated IO error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 7. getAllBlogTypes tests ---
    @Test
    void testGetAllBlogTypes_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = blogController.getAllBlogTypes();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> types = response.getBody().getData();
        assertEquals(BlogType.values().length, types.size());
        assertTrue(types.contains(BlogType.PERSONAL.name()));
        assertTrue(types.contains(BlogType.NICHE.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 8. getAllBlogStatuses tests ---
    @Test
    void testGetAllBlogStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = blogController.getAllBlogStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(BlogStatus.values().length, statuses.size());
        assertTrue(statuses.contains(BlogStatus.DRAFT.name()));
        assertTrue(statuses.contains(BlogStatus.PUBLISHED.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 9. getBlogsByAgeGroup tests ---
    @Test
    void testGetBlogsByAgeGroup_Success() {
        AgeGroup ageGroup = AgeGroup.ADULT;
        List<BlogResponse> mockList = Arrays.asList(
                BlogResponse.builder().blogName("Adult Blog").ageGroup(AgeGroup.ADULT).build(),
                BlogResponse.builder().blogName("Everyone Blog").ageGroup(AgeGroup.EVERYONE).build()
        );
        when(blogService.getBlogsByAgeGroup(ageGroup)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByAgeGroup(ageGroup);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(blogService).getBlogsByAgeGroup(ageGroup);
    }

    @Test
    void testGetBlogsByAgeGroup_NoBlogsFound() {
        AgeGroup ageGroup = AgeGroup.ADOLESCENT;
        when(blogService.getBlogsByAgeGroup(ageGroup)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByAgeGroup(ageGroup);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(blogService).getBlogsByAgeGroup(ageGroup);
    }

    // --- 10. getMyBlogsByStatus tests ---
    @Test
    void testGetMyBlogsByStatus_Success() {
        String username = "testuser";
        BlogStatus status = BlogStatus.PUBLISHED;
        List<BlogResponse> mockList = Arrays.asList(
                BlogResponse.builder().blogName("My Published Blog 1").build(),
                BlogResponse.builder().blogName("My Published Blog 2").build()
        );
        when(blogService.getMyBlogsByStatus(username, status)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getMyBlogsByStatus(username, status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(blogService).getMyBlogsByStatus(username, status);
    }

    @Test
    void testGetMyBlogsByStatus_NoBlogsFound() {
        String username = "testuser";
        BlogStatus status = BlogStatus.PUBLISHED;
        when(blogService.getMyBlogsByStatus(username, status)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getMyBlogsByStatus(username, status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(blogService).getMyBlogsByStatus(username, status);
    }

    // --- 11. getBlogsByStatusExceptRole tests ---
    @Test
    void testGetBlogsByStatusExceptRole_Success() {
        BlogStatus status = BlogStatus.PUBLISHED;
        Role role = Role.ADMIN;
        List<BlogResponse> mockList = Arrays.asList(
                BlogResponse.builder().blogName("User Blog").build(),
                BlogResponse.builder().blogName("Moderator Blog").build()
        );
        when(blogService.getBlogsByStatusExceptRole(status, role)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByStatusExceptRole(status, role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(blogService).getBlogsByStatusExceptRole(status, role);
    }

    @Test
    void testGetBlogsByStatusExceptRole_NoBlogsFound() {
        BlogStatus status = BlogStatus.DRAFT;
        Role role = Role.MEMBER;
        when(blogService.getBlogsByStatusExceptRole(status, role)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByStatusExceptRole(status, role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(blogService).getBlogsByStatusExceptRole(status, role);
    }

    // --- 12. getBlogsByRole tests ---
    @Test
    void testGetBlogsByRole_Success() {
        Role role = Role.MEMBER;
        List<BlogResponse> mockList = Arrays.asList(
                BlogResponse.builder().blogName("Blog by User 1").build(),
                BlogResponse.builder().blogName("Blog by User 2").build()
        );
        when(blogService.getBlogsByRole(role)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByRole(role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(blogService).getBlogsByRole(role);
    }

    @Test
    void testGetBlogsByRole_NoBlogsFound() {
        Role role = Role.STAFF;
        when(blogService.getBlogsByRole(role)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByRole(role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(blogService).getBlogsByRole(role);
    }

    // --- 13. getBlogsByStatusAndRole tests ---
    @Test
    void testGetBlogsByStatusAndRole_Success() {
        BlogStatus status = BlogStatus.PUBLISHED;
        Role role = Role.STAFF;
        List<BlogResponse> mockList = Collections.singletonList(
                BlogResponse.builder().blogName("Published by Moderator").build()
        );
        when(blogService.getBlogsByStatusAndRole(status, role)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByStatusAndRole(status, role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getData().size());
        verify(blogService).getBlogsByStatusAndRole(status, role);
    }

    @Test
    void testGetBlogsByStatusAndRole_NoBlogsFound() {
        BlogStatus status = BlogStatus.PENDING;
        Role role = Role.ADMIN;
        when(blogService.getBlogsByStatusAndRole(status, role)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByStatusAndRole(status, role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(blogService).getBlogsByStatusAndRole(status, role);
    }

    // --- 14. getBlogsByStatus tests ---
    @Test
    void testGetBlogsByStatus_Success() {
        BlogStatus status = BlogStatus.DRAFT;
        List<BlogResponse> mockList = Arrays.asList(
                BlogResponse.builder().blogName("Draft Blog 1").build(),
                BlogResponse.builder().blogName("Draft Blog 2").build()
        );
        when(blogService.getBlogsByStatus(status)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(blogService).getBlogsByStatus(status);
    }

    @Test
    void testGetBlogsByStatus_NoBlogsFound() {
        BlogStatus status = BlogStatus.PUBLISHED;
        when(blogService.getBlogsByStatus(status)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<BlogResponse>>> response = blogController.getBlogsByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(blogService).getBlogsByStatus(status);
    }
}