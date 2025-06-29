package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AssessmentResultResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.services.AssessmentResultService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.GoogleSheetsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/assessment-result")
@RequiredArgsConstructor
public class AssessmentResultController {

    private final AssessmentResultService assessmentResultService;
    private final ExcelService excelService;
    private final GoogleSheetsService googleSheetsService;

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

    @GetMapping("/risk-level")
    public ResponseEntity<ApiResponse<List<String>>> getAllAssessmentRiskLevel() {
        List<String> levels = Arrays.stream(RiskLevel.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(levels)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/sync")
    public ResponseEntity<String> readFromGGSheet() throws GeneralSecurityException, IOException {
        googleSheetsService.importDataFromSheet();
        return ResponseEntity.ok("Google sheet data saved Assessment Results into DB");
    }
}
