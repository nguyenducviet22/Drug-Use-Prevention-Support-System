package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EnrollmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Enrollment;
import com.swp.drug_use_prevention_support_system.services.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollment")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> createEnrollment(@Valid @RequestBody CreateEnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.createEnrollment(request);
        ApiResponse<EnrollmentResponse> apiResponse = ApiResponse.<EnrollmentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getAllEnrollments() {
        List<EnrollmentResponse> responses = enrollmentService.getAllEnrollments();
        ApiResponse<List<EnrollmentResponse>> apiResponse = ApiResponse.<List<EnrollmentResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-list/{username}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getMemberEnrollments(@PathVariable String username) {
        List<EnrollmentResponse> responses = enrollmentService.getMemberEnrollments(username);
        ApiResponse<List<EnrollmentResponse>> apiResponse = ApiResponse.<List<EnrollmentResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/course-list/{id}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getCourseEnrollments(@PathVariable UUID id) {
        List<EnrollmentResponse> responses = enrollmentService.getCourseEnrollments(id);
        ApiResponse<List<EnrollmentResponse>> apiResponse = ApiResponse.<List<EnrollmentResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollment(@PathVariable UUID id) {
        EnrollmentResponse response = enrollmentService.getEnrollment(id);
        ApiResponse<EnrollmentResponse> apiResponse = ApiResponse.<EnrollmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateEnrollment(@PathVariable UUID id,
                                                                            @RequestBody UpdateEnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.updateEnrollment(id, request);
        ApiResponse<EnrollmentResponse> apiResponse = ApiResponse.<EnrollmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> deleteEnrollment(@PathVariable UUID id) {
        EnrollmentResponse response = enrollmentService.deleteEnrollment(id);
        ApiResponse<EnrollmentResponse> apiResponse = ApiResponse.<EnrollmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
