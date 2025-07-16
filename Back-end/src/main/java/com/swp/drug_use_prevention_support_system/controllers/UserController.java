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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.register(request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PostMapping("/internal")
    public ResponseEntity<ApiResponse<UserResponse>> createInternalUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createInternalUser(request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        List<UserResponse> responses = userService.getAllUsers();
        ApiResponse<List<UserResponse>> apiResponses = ApiResponse.<List<UserResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserInfo(@PathVariable String username) {
        UserResponse response = userService.getUserByUsername(username);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-info")
    public ResponseEntity<ApiResponse<UserResponse>> getMyInfo() {
        UserResponse response = userService.getMyInfo();
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{username}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable String username,
                                                                @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(username, request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/status/{username}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importUsers(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importUsersFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved users into DB");
    }

    @GetMapping("/gender")
    public ResponseEntity<ApiResponse<List<String>>> getAllGenders() {
        List<String> genders = Arrays.stream(Gender.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(genders)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/role")
    public ResponseEntity<ApiResponse<List<String>>> getAllRoles() {
        List<String> roles = Arrays.stream(Role.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(roles)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<String>>> getAllUserStatuses() {
        List<String> statuses = Arrays.stream(UserStatus.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(statuses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/age-group")
    public ResponseEntity<ApiResponse<List<String>>> getAllAgeGroups() {
        List<String> groups = Arrays.stream(AgeGroup.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(groups)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/consultants")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getConsultants() {
        List<UserResponse> responses = userService.getUsersByRole(Role.CONSULTANT);
        ApiResponse<List<UserResponse>> apiResponses = ApiResponse.<List<UserResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/{username}/members")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getMembersOfConsultant(@PathVariable String username) {
        List<UserResponse> responses = userService.getMembersOfConsultant(username);
        ApiResponse<List<UserResponse>> apiResponses = ApiResponse.<List<UserResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    //ADMIN SECTION
    @GetMapping("/no-admin")
    public ResponseEntity<?> getAllUsersExceptAdmin() {
        List<UserResponse> responses = userService.getAllUsersExceptAdmin();
        ApiResponse<List<UserResponse>> apiResponses = ApiResponse.<List<UserResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    //Get Users by Role
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable("role") Role role) {
        List<UserResponse> users = userService.getUsersByRole(role);
        return ResponseEntity.ok().body(Map.of("data", users));
    }

    @PutMapping("/toggleStatus/{username}")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable String username) {
        userService.toggleUserStatus(username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("admin/{username}")
    public ResponseEntity<ApiResponse<Void>> deletePermanentUser(@PathVariable String username) {
        userService.deletePermanentUser(username);
        return ResponseEntity.noContent().build();
    }
}
