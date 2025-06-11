package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserDetailsResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.UserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-details")
@RequiredArgsConstructor
public class UserDetailsController {

    private final UserDetailsService userDetailsService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserDetailsResponse>> createUserDetails(@Valid @RequestBody CreateUserDetailsRequest request) {
        UserDetailsResponse response = userDetailsService.createUserDetails(request);
        ApiResponse<UserDetailsResponse> apiResponse = ApiResponse.<UserDetailsResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDetailsResponse>>> getUserDetailsList() {
        List<UserDetailsResponse> responses = userDetailsService.getAllUserDetails();
        ApiResponse<List<UserDetailsResponse>> apiResponse = ApiResponse.<List<UserDetailsResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-list/{username}")
    public ResponseEntity<ApiResponse<List<UserDetailsResponse>>> getMemberUserDetailsList(@PathVariable String username) {
        List<UserDetailsResponse> responses = userDetailsService.getMemberUserDetails(username);
        ApiResponse<List<UserDetailsResponse>> apiResponse = ApiResponse.<List<UserDetailsResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsResponse>> getUserDetails(@PathVariable UUID id) {
        UserDetailsResponse response = userDetailsService.getUserDetails(id);
        ApiResponse<UserDetailsResponse> apiResponse = ApiResponse.<UserDetailsResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsResponse>> updateUserDetails(@PathVariable UUID id,
                                                                              @RequestBody UpdateUserDetailsRequest request) {
        UserDetailsResponse response = userDetailsService.updateUserDetails(id, request);
        ApiResponse<UserDetailsResponse> apiResponse = ApiResponse.<UserDetailsResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsResponse>> deleteUserDetails(@PathVariable UUID id) {
        UserDetailsResponse response = userDetailsService.deleteUserDetails(id);
        ApiResponse<UserDetailsResponse> apiResponse = ApiResponse.<UserDetailsResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importUserDetails(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importUserDetailsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved User Details into DB");
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<String>>> getAllUserDetailsStatuses() {
        List<String> statuses = Arrays.stream(UserStatus.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(statuses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
