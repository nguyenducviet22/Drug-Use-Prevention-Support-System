package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.services.AssessmentService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<AssessmentResponse>> createAssessment(@Valid @RequestBody CreateAssessmentRequest request) {
        AssessmentResponse response = assessmentService.createAssessment(request);
        ApiResponse<AssessmentResponse> apiResponse = ApiResponse.<AssessmentResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssessmentResponse>>> getAssessments() {
        List<AssessmentResponse> responses = assessmentService.getAllAssessments();
        ApiResponse<List<AssessmentResponse>> apiResponse = ApiResponse.<List<AssessmentResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssessmentResponse>> getAssessment(@PathVariable UUID id) {
        AssessmentResponse response = assessmentService.getAssessment(id);
        ApiResponse<AssessmentResponse> apiResponse = ApiResponse.<AssessmentResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssessmentResponse>> updateAssessment(@PathVariable UUID id,
                                                                            @RequestBody UpdateAssessmentRequest request) {
        AssessmentResponse response = assessmentService.updateAssessment(id, request);
        ApiResponse<AssessmentResponse> apiResponse = ApiResponse.<AssessmentResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}/{status}")
    public ResponseEntity<ApiResponse<Void>> updateAssessmentStatus(@PathVariable UUID id,
                                                              @PathVariable CourseStatus status) {
        assessmentService.updateAssessmentStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importUserDetails(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importAssessmentsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Assessments into DB");
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<String>>> getAllAssessmentStatuses() {
        List<String> statuses = Arrays.stream(CourseStatus.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(statuses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
