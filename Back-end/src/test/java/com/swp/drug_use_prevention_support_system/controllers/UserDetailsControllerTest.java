package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserDetailsResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.UserDetailsService;
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

class UserDetailsControllerTest {

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private UserDetailsController userDetailsController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createUserDetails tests ---
    @Test
    void testCreateUserDetails_Success() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder()
                .address("123 Main St")
                .phoneNumber("1234567890")
                .build();
        UserDetailsResponse mockResponse = UserDetailsResponse.builder()
                .address("123 Main St")
                .build();
        when(userDetailsService.createUserDetails(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<UserDetailsResponse>> response = userDetailsController.createUserDetails(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("123 Main St", response.getBody().getData().getAddress());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(userDetailsService).createUserDetails(request);
    }

    @Test
    void testCreateUserDetails_InvalidInput() {
        CreateUserDetailsRequest invalidRequest = CreateUserDetailsRequest.builder()
                .address("") // Invalid
                .phoneNumber("invalid phone") // Invalid
                .build();

        // Simulate validation error from service layer or controller's @Valid
        when(userDetailsService.createUserDetails(invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> userDetailsController.createUserDetails(invalidRequest));
        verify(userDetailsService).createUserDetails(invalidRequest);
    }

    // --- 2. getUserDetailsList tests ---
    @Test
    void testGetUserDetailsList_Success() {
        List<UserDetailsResponse> mockList = Arrays.asList(
                UserDetailsResponse.builder().address("Address1").build(),
                UserDetailsResponse.builder().address("Address2").build()
        );
        when(userDetailsService.getAllUserDetails()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<UserDetailsResponse>>> response = userDetailsController.getUserDetailsList();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userDetailsService).getAllUserDetails();
    }

    @Test
    void testGetUserDetailsList_NoUserDetailsFound() {
        when(userDetailsService.getAllUserDetails()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<UserDetailsResponse>>> response = userDetailsController.getUserDetailsList();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userDetailsService).getAllUserDetails();
    }

    // --- 3. getMemberUserDetailsList tests ---
    @Test
    void testGetMemberUserDetailsList_Success() {
        String username = "memberUser";
        List<UserDetailsResponse> mockList = Arrays.asList(
                UserDetailsResponse.builder().address("Member Address 1").build(),
                UserDetailsResponse.builder().address("Member Address 2").build()
        );
        when(userDetailsService.getMemberUserDetails(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<UserDetailsResponse>>> response = userDetailsController.getMemberUserDetailsList(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userDetailsService).getMemberUserDetails(username);
    }

    @Test
    void testGetMemberUserDetailsList_NoUserDetailsFoundForMember() {
        String username = "memberUserWithNoDetails";
        when(userDetailsService.getMemberUserDetails(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<UserDetailsResponse>>> response = userDetailsController.getMemberUserDetailsList(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userDetailsService).getMemberUserDetails(username);
    }

    @Test
    void testGetMemberUserDetailsList_MemberNotFound() {
        String nonExistentUsername = "nonExistentMember";
        when(userDetailsService.getMemberUserDetails(nonExistentUsername)).thenThrow(new NoSuchElementException("Member not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> userDetailsController.getMemberUserDetailsList(nonExistentUsername));
        assertTrue(exception.getMessage().contains("Member not found"));
        verify(userDetailsService).getMemberUserDetails(nonExistentUsername);
    }

    // --- 4. getUserDetails tests ---
    @Test
    void testGetUserDetails_Success() {
        UUID id = UUID.randomUUID();
        UserDetailsResponse mockResponse = UserDetailsResponse.builder().detailID(id).address("Specific Address").build();
        when(userDetailsService.getUserDetails(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<UserDetailsResponse>> response = userDetailsController.getUserDetails(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getDetailID());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userDetailsService).getUserDetails(id);
    }

    @Test
    void testGetUserDetails_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(userDetailsService.getUserDetails(nonExistentId)).thenThrow(new NoSuchElementException("User Details not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> userDetailsController.getUserDetails(nonExistentId));
        assertTrue(exception.getMessage().contains("User Details not found"));
        verify(userDetailsService).getUserDetails(nonExistentId);
    }

    // --- 5. updateUserDetails tests ---
    @Test
    void testUpdateUserDetails_Success() {
        UUID id = UUID.randomUUID();
        UpdateUserDetailsRequest request = UpdateUserDetailsRequest.builder()
                .address("Updated Address")
                .phoneNumber("0987654321")
                .build();
        UserDetailsResponse updatedResponse = UserDetailsResponse.builder().detailID(id).address("Updated Address").build();
        when(userDetailsService.updateUserDetails(id, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<UserDetailsResponse>> response = userDetailsController.updateUserDetails(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Address", response.getBody().getData().getAddress());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userDetailsService).updateUserDetails(id, request);
    }

    @Test
    void testUpdateUserDetails_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateUserDetailsRequest request = UpdateUserDetailsRequest.builder().address("Update").build();
        when(userDetailsService.updateUserDetails(nonExistentId, request)).thenThrow(new NoSuchElementException("User Details to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> userDetailsController.updateUserDetails(nonExistentId, request));
        assertTrue(exception.getMessage().contains("User Details to update not found"));
        verify(userDetailsService).updateUserDetails(nonExistentId, request);
    }

    @Test
    void testUpdateUserDetails_InvalidInput() {
        UUID id = UUID.randomUUID();
        UpdateUserDetailsRequest invalidRequest = UpdateUserDetailsRequest.builder()
                .phoneNumber("short") // Invalid
                .build();

        // Simulate validation error from service layer
        when(userDetailsService.updateUserDetails(id, invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> userDetailsController.updateUserDetails(id, invalidRequest));
        verify(userDetailsService).updateUserDetails(id, invalidRequest);
    }

    // --- 6. deleteUserDetails tests ---
    @Test
    void testDeleteUserDetails_Success() {
        UUID id = UUID.randomUUID();
        UserDetailsResponse mockResponse = UserDetailsResponse.builder().detailID(id).status(UserStatus.INACTIVE).build();
        when(userDetailsService.deleteUserDetails(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<UserDetailsResponse>> response = userDetailsController.deleteUserDetails(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(UserStatus.INACTIVE, response.getBody().getData().getStatus());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userDetailsService).deleteUserDetails(id);
    }

    @Test
    void testDeleteUserDetails_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(userDetailsService.deleteUserDetails(nonExistentId)).thenThrow(new NoSuchElementException("User Details for delete not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> userDetailsController.deleteUserDetails(nonExistentId));
        assertTrue(exception.getMessage().contains("User Details for delete not found"));
        verify(userDetailsService).deleteUserDetails(nonExistentId);
    }

    // --- 7. importUserDetails tests ---
    @Test
    void testImportUserDetails_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importUserDetailsFromExcel(any(InputStream.class));

        ResponseEntity<String> response = userDetailsController.importUserDetails(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved User Details into DB", response.getBody());
        verify(excelService).importUserDetailsFromExcel(mockInputStream);
    }

    @Test
    void testImportUserDetails_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = userDetailsController.importUserDetails(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportUserDetails_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> userDetailsController.importUserDetails(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 8. getAllUserDetailsStatuses tests ---
    @Test
    void testGetAllUserDetailsStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = userDetailsController.getAllUserDetailsStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(UserStatus.values().length, statuses.size());
        assertTrue(statuses.contains(UserStatus.ACTIVE.name()));
        assertTrue(statuses.contains(UserStatus.INACTIVE.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }
}