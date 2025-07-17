package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEnrollmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EnrollmentResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.EnrollmentStatus;
import com.swp.drug_use_prevention_support_system.services.EnrollmentService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollment")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> createEnrollment(@Valid @RequestBody CreateEnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.createEnrollment(request);
        ApiResponse<EnrollmentResponse> apiResponse = ApiResponse.<EnrollmentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/all")
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

    @GetMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollment(@RequestParam UUID courseID,
                                                                         @RequestParam String username) {
        EnrollmentResponse response = enrollmentService.getEnrollmentByUsernameAndCourseID(courseID, username);
        ApiResponse<EnrollmentResponse> apiResponse = ApiResponse.<EnrollmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}/{status}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateEnrollmentStatus(@PathVariable UUID id,
                                                                                  @PathVariable EnrollmentStatus status) {
        EnrollmentResponse response = enrollmentService.updateEnrollmentStatus(id, status);
        ApiResponse<EnrollmentResponse> apiResponse = ApiResponse.<EnrollmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importEnrollments(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importEnrollmentsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Enrollments into DB");
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<String>>> getAllEnrollmentStatuses() {
        List<String> statuses = Arrays.stream(EnrollmentStatus.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(statuses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }


    ////ADMIN HOMEPAGE
    @GetMapping("/admin/completion-by-age-group")
    public ResponseEntity<Map<String, Object>> getCompletedEnrollmentStats() {
        return ResponseEntity.ok(enrollmentService.getCompletedEnrollmentByAgeGroup());
    }
}
