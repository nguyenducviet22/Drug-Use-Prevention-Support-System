package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.services.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class CloudinaryControllerTest {

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CloudinaryController cloudinaryController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. uploadImage tests ---
    @Test
    void testUploadImage_Success() throws IOException {
        // Arrange
        byte[] content = "test image content".getBytes();
        MultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", content);
        String expectedImageUrl = "http://cloudinary.com/test_image.jpg";

        when(cloudinaryService.uploadImage(file)).thenReturn(expectedImageUrl);

        // Act
        ResponseEntity<String> responseEntity = cloudinaryController.uploadImage(file);

        // Assert
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedImageUrl, responseEntity.getBody());
        verify(cloudinaryService).uploadImage(file); // Verify service method was called
    }

    @Test
    void testUploadImage_EmptyFile() throws IOException {
        // Arrange
        MultipartFile emptyFile = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);

        // Simulate service throwing IOException for empty file or handling it
        // Depending on service logic, it might throw IllegalArgumentException or similar
        // For this test, we assume service might throw IOException for empty files if not explicitly handled
        when(cloudinaryService.uploadImage(emptyFile)).thenThrow(new IOException("File is empty or invalid."));

        // Act
        ResponseEntity<String> responseEntity = cloudinaryController.uploadImage(emptyFile);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
        assertEquals("Failed to upload image: File is empty or invalid.", responseEntity.getBody());
        verify(cloudinaryService).uploadImage(emptyFile);
    }

    @Test
    void testUploadImage_IOException() throws IOException {
        // Arrange
        byte[] content = "test image content".getBytes();
        MultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", content);

        // Simulate an IOException during the upload process in the service
        when(cloudinaryService.uploadImage(file)).thenThrow(new IOException("Network error during upload."));

        // Act
        ResponseEntity<String> responseEntity = cloudinaryController.uploadImage(file);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
        assertEquals("Failed to upload image: Network error during upload.", responseEntity.getBody());
        verify(cloudinaryService).uploadImage(file); // Verify service method was called
    }
}