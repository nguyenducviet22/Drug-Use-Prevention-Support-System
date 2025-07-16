package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.Gender;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.UserService;
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

class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. register tests ---
    @Test
    void testRegister_Success() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("testUser")
                .password("password123")
                .build();
        UserResponse mockResponse = UserResponse.builder().username("testUser").build();
        when(userService.register(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("testUser", response.getBody().getData().getUsername());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(userService).register(request);
    }

    @Test
    void testRegister_InvalidInput() {
        CreateUserRequest invalidRequest = CreateUserRequest.builder()
                .username("") // Invalid
                .password("") // Invalid
                .build();

        when(userService.register(invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> userController.register(invalidRequest));
        verify(userService).register(invalidRequest);
    }

    // --- 2. createInternalUser tests ---
    @Test
    void testCreateInternalUser_Success() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("internalUser")
                .password("internalPass")
                .build();
        UserResponse mockResponse = UserResponse.builder().username("internalUser").build();
        when(userService.createInternalUser(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.createInternalUser(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode()); // Note: controller returns CREATED, service returns OK. Stick to controller's behavior.
        assertNotNull(response.getBody());
        assertEquals("internalUser", response.getBody().getData().getUsername());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(userService).createInternalUser(request);
    }

    @Test
    void testCreateInternalUser_InvalidInput() {
        CreateUserRequest invalidRequest = CreateUserRequest.builder()
                .username("u") // Too short
                .build();

        when(userService.createInternalUser(invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> userController.createInternalUser(invalidRequest));
        verify(userService).createInternalUser(invalidRequest);
    }

    // --- 3. getUsers tests ---
    @Test
    void testGetUsers_Success() {
        List<UserResponse> mockList = Arrays.asList(
                UserResponse.builder().username("user1").build(),
                UserResponse.builder().username("user2").build()
        );
        when(userService.getAllUsers()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.getUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userService).getAllUsers();
    }

    @Test
    void testGetUsers_NoUsersFound() {
        when(userService.getAllUsers()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.getUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userService).getAllUsers();
    }

    // --- 4. getUserInfo tests ---
    @Test
    void testGetUserInfo_Success() {
        String username = "existingUser";
        UserResponse mockResponse = UserResponse.builder().username(username).build();
        when(userService.getUserByUsername(username)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.getUserInfo(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(username, response.getBody().getData().getUsername());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(userService).getUserByUsername(username);
    }

    @Test
    void testGetUserInfo_NotFound() {
        String nonExistentUsername = "nonExistent";
        when(userService.getUserByUsername(nonExistentUsername)).thenThrow(new NoSuchElementException("User not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> userController.getUserInfo(nonExistentUsername));
        assertTrue(exception.getMessage().contains("User not found"));
        verify(userService).getUserByUsername(nonExistentUsername);
    }

    // --- 5. getMyInfo tests ---
    @Test
    void testGetMyInfo_Success() {
        UserResponse mockResponse = UserResponse.builder().username("currentUser").build();
        when(userService.getMyInfo()).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.getMyInfo();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("currentUser", response.getBody().getData().getUsername());
        verify(userService).getMyInfo();
    }

    @Test
    void testGetMyInfo_NotAuthenticated() {
        // Assuming getMyInfo() would throw if no authenticated user is found
        when(userService.getMyInfo()).thenThrow(new IllegalStateException("No authenticated user"));

        Exception exception = assertThrows(IllegalStateException.class, () -> userController.getMyInfo());
        assertTrue(exception.getMessage().contains("No authenticated user"));
        verify(userService).getMyInfo();
    }

    // --- 6. updateUser tests ---
    @Test
    void testUpdateUser_Success() {
        String username = "updateUser";
        UpdateUserRequest request = UpdateUserRequest.builder()
                .fullName("Updated Name")
                .email("updated@example.com")
                .build();
        UserResponse updatedResponse = UserResponse.builder().username(username).fullName("Updated Name").build();
        when(userService.updateUser(username, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.updateUser(username, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Name", response.getBody().getData().getFullName());
        verify(userService).updateUser(username, request);
    }

    @Test
    void testUpdateUser_NotFound() {
        String nonExistentUsername = "nonExistent";
        UpdateUserRequest request = UpdateUserRequest.builder().fullName("New Name").build();
        when(userService.updateUser(nonExistentUsername, request)).thenThrow(new NoSuchElementException("User to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> userController.updateUser(nonExistentUsername, request));
        assertTrue(exception.getMessage().contains("User to update not found"));
        verify(userService).updateUser(nonExistentUsername, request);
    }

    @Test
    void testUpdateUser_InvalidInput() {
        String username = "testUser";
        UpdateUserRequest invalidRequest = UpdateUserRequest.builder()
                .email("invalid-email-format") // Invalid
                .build();

        when(userService.updateUser(username, invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> userController.updateUser(username, invalidRequest));
        verify(userService).updateUser(username, invalidRequest);
    }

    // --- 7. deleteUser (soft delete) tests ---
    @Test
    void testDeleteUser_Success() {
        String username = "userToDelete";
        doNothing().when(userService).deleteUser(username);

        ResponseEntity<ApiResponse<Void>> response = userController.deleteUser(username);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody()); // No content body
        verify(userService).deleteUser(username);
    }

    @Test
    void testDeleteUser_NotFound() {
        String nonExistentUsername = "nonExistent";
        doThrow(new NoSuchElementException("User not found for soft delete")).when(userService).deleteUser(nonExistentUsername);

        Exception exception = assertThrows(NoSuchElementException.class, () -> userController.deleteUser(nonExistentUsername));
        assertTrue(exception.getMessage().contains("User not found for soft delete"));
        verify(userService).deleteUser(nonExistentUsername);
    }

    // --- 8. importUsers tests ---
    @Test
    void testImportUsers_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importUsersFromExcel(any(InputStream.class));

        ResponseEntity<String> response = userController.importUsers(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved users into DB", response.getBody());
        verify(excelService).importUsersFromExcel(mockInputStream);
    }

    @Test
    void testImportUsers_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = userController.importUsers(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportUsers_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> userController.importUsers(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 9. getAllGenders tests ---
    @Test
    void testGetAllGenders_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = userController.getAllGenders();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> genders = response.getBody().getData();
        assertEquals(Gender.values().length, genders.size());
        assertTrue(genders.contains(Gender.MALE.name()));
        assertTrue(genders.contains(Gender.FEMALE.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 10. getAllRoles tests ---
    @Test
    void testGetAllRoles_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = userController.getAllRoles();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> roles = response.getBody().getData();
        assertEquals(Role.values().length, roles.size());
        assertTrue(roles.contains(Role.ADMIN.name()));
        assertTrue(roles.contains(Role.CONSULTANT.name()));
        assertTrue(roles.contains(Role.STAFF.name()));
        assertTrue(roles.contains(Role.MEMBER.name()));
        assertTrue(roles.contains(Role.MANAGER.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 11. getAllUserStatuses tests ---
    @Test
    void testGetAllUserStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = userController.getAllUserStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(UserStatus.values().length, statuses.size());
        assertTrue(statuses.contains(UserStatus.ACTIVE.name()));
        assertTrue(statuses.contains(UserStatus.INACTIVE.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 12. getAllAgeGroups tests ---
    @Test
    void testGetAllAgeGroups_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = userController.getAllAgeGroups();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> groups = response.getBody().getData();
        assertEquals(AgeGroup.values().length, groups.size());
        assertTrue(groups.contains(AgeGroup.EVERYONE.name()));
        assertTrue(groups.contains(AgeGroup.ADOLESCENT.name()));
        assertTrue(groups.contains(AgeGroup.SENIOR.name()));
        assertTrue(groups.contains(AgeGroup.ADULT.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    // --- 13. getConsultants tests ---
    @Test
    void testGetConsultants_Success() {
        List<UserResponse> mockList = Arrays.asList(
                UserResponse.builder().username("consultant1").build(),
                UserResponse.builder().username("consultant2").build()
        );
        when(userService.getUsersByRole(Role.CONSULTANT)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.getConsultants();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(userService).getUsersByRole(Role.CONSULTANT);
    }

    @Test
    void testGetConsultants_NoConsultantsFound() {
        when(userService.getUsersByRole(Role.CONSULTANT)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.getConsultants();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(userService).getUsersByRole(Role.CONSULTANT);
    }

    // --- 14. getMembersOfConsultant tests ---
    @Test
    void testGetMembersOfConsultant_Success() {
        String consultantUsername = "consultantA";
        List<UserResponse> mockMembers = Arrays.asList(
                UserResponse.builder().username("member1").build(),
                UserResponse.builder().username("member2").build()
        );
        when(userService.getMembersOfConsultant(consultantUsername)).thenReturn(mockMembers);

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.getMembersOfConsultant(consultantUsername);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(userService).getMembersOfConsultant(consultantUsername);
    }

    @Test
    void testGetMembersOfConsultant_NoMembersFound() {
        String consultantUsername = "consultantB";
        when(userService.getMembersOfConsultant(consultantUsername)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.getMembersOfConsultant(consultantUsername);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(userService).getMembersOfConsultant(consultantUsername);
    }

    @Test
    void testGetMembersOfConsultant_ConsultantNotFound() {
        String nonExistentConsultant = "nonExistentConsultant";
        when(userService.getMembersOfConsultant(nonExistentConsultant)).thenThrow(new NoSuchElementException("Consultant not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> userController.getMembersOfConsultant(nonExistentConsultant));
        assertTrue(exception.getMessage().contains("Consultant not found"));
        verify(userService).getMembersOfConsultant(nonExistentConsultant);
    }

    // --- 15. getAllUsersExceptAdmin tests ---
    @Test
    void testGetAllUsersExceptAdmin_Success() {
        List<UserResponse> mockList = Arrays.asList(
                UserResponse.builder().username("user").build(),
                UserResponse.builder().username("consultant").build()
        );
        when(userService.getAllUsersExceptAdmin()).thenReturn(mockList);

        ResponseEntity<?> response = userController.getAllUsersExceptAdmin();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        // Need to cast to ApiResponse if checking status/data, otherwise check raw body as Map if controller returns Map.
        // Given the return type of the method `ResponseEntity<?>` and then `Map.of("data", users)` for getUsersByRole
        // Let's assume for getAllUsersExceptAdmin it also returns ApiResponse<List<UserResponse>> based on the controller method.
        @SuppressWarnings("unchecked")
        ApiResponse<List<UserResponse>> apiResponse = (ApiResponse<List<UserResponse>>) response.getBody();
        assertEquals(2, apiResponse.getData().size());
        assertEquals(HttpStatus.OK.value(), apiResponse.getStatus());
        verify(userService).getAllUsersExceptAdmin();
    }

    @Test
    void testGetAllUsersExceptAdmin_NoNonAdminUsersFound() {
        when(userService.getAllUsersExceptAdmin()).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = userController.getAllUsersExceptAdmin();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        ApiResponse<List<UserResponse>> apiResponse = (ApiResponse<List<UserResponse>>) response.getBody();
        assertTrue(apiResponse.getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), apiResponse.getStatus());
        verify(userService).getAllUsersExceptAdmin();
    }

    // --- 16. getUsersByRole tests ---
    @Test
    void testGetUsersByRole_Success() {
        Role role = Role.MEMBER;
        List<UserResponse> mockList = Arrays.asList(
                UserResponse.builder().username("userOne").build(),
                UserResponse.builder().username("userTwo").build()
        );
        when(userService.getUsersByRole(role)).thenReturn(mockList);

        ResponseEntity<?> response = userController.getUsersByRole(role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        Map<String, List<UserResponse>> responseBody = (Map<String, List<UserResponse>>) response.getBody();
        assertEquals(2, responseBody.get("data").size());
        verify(userService).getUsersByRole(role);
    }

    @Test
    void testGetUsersByRole_NoUsersFoundForRole() {
        Role role = Role.MEMBER;
        when(userService.getUsersByRole(role)).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = userController.getUsersByRole(role);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        Map<String, List<UserResponse>> responseBody = (Map<String, List<UserResponse>>) response.getBody();
        assertTrue(responseBody.get("data").isEmpty());
        verify(userService).getUsersByRole(role);
    }

    // --- 17. toggleUserStatus tests ---
    @Test
    void testToggleUserStatus_Success() {
        String username = "toggleUser";
        doNothing().when(userService).toggleUserStatus(username);

        ResponseEntity<ApiResponse<Void>> response = userController.toggleUserStatus(username);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(userService).toggleUserStatus(username);
    }

    @Test
    void testToggleUserStatus_NotFound() {
        String nonExistentUsername = "nonExistentToggle";
        doThrow(new NoSuchElementException("User not found for toggle")).when(userService).toggleUserStatus(nonExistentUsername);

        Exception exception = assertThrows(NoSuchElementException.class, () -> userController.toggleUserStatus(nonExistentUsername));
        assertTrue(exception.getMessage().contains("User not found for toggle"));
        verify(userService).toggleUserStatus(nonExistentUsername);
    }

    // --- 18. deletePermanentUser tests ---
    @Test
    void testDeletePermanentUser_Success() {
        String username = "permanentDeleteUser";
        doNothing().when(userService).deletePermanentUser(username);

        ResponseEntity<ApiResponse<Void>> response = userController.deletePermanentUser(username);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(userService).deletePermanentUser(username);
    }

    @Test
    void testDeletePermanentUser_NotFound() {
        String nonExistentUsername = "nonExistentPermanentDelete";
        doThrow(new NoSuchElementException("User not found for permanent delete")).when(userService).deletePermanentUser(nonExistentUsername);

        Exception exception = assertThrows(NoSuchElementException.class, () -> userController.deletePermanentUser(nonExistentUsername));
        assertTrue(exception.getMessage().contains("User not found for permanent delete"));
        verify(userService).deletePermanentUser(nonExistentUsername);
    }
}
