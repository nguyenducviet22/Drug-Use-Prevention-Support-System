package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAssessmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResultResponse;
import com.swp.drug_use_prevention_support_system.services.AssessmentResultService;
import com.swp.drug_use_prevention_support_system.services.AssessmentService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assessment-result")
@RequiredArgsConstructor
public class AssessmentResultController {

    private final AssessmentResultService assessmentResultService;
    private final ExcelService excelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssessmentResultResponse>>> getAssessmentResults() {
        List<AssessmentResultResponse> responses = assessmentResultService.getAllAssessmentResults();
        ApiResponse<List<AssessmentResultResponse>> apiResponse = ApiResponse.<List<AssessmentResultResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-list/{username}")
    public ResponseEntity<ApiResponse<List<AssessmentResultResponse>>> getMyAssessments(@PathVariable String username) {
        List<AssessmentResultResponse> responses = assessmentResultService.getUserAssessmentResults(username);
        ApiResponse<List<AssessmentResultResponse>> apiResponse = ApiResponse.<List<AssessmentResultResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssessmentResultResponse>> getAssessment(@PathVariable UUID id) {
        AssessmentResultResponse response = assessmentResultService.getAssessmentResult(id);
        ApiResponse<AssessmentResultResponse> apiResponse = ApiResponse.<AssessmentResultResponse>builder()
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
        excelService.importAssessmentResultsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Assessment Results into DB");
    }
}
