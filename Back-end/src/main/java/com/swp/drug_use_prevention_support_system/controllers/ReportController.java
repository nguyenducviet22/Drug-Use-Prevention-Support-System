package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.ReportRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ReportResponse;
import com.swp.drug_use_prevention_support_system.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getLineChartData(@RequestBody ReportRequest request) {
        List<ReportResponse> responses = reportService.getLineChartData(request);
        ApiResponse<List<ReportResponse>> apiResponse = ApiResponse.<List<ReportResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ReportResponse>> getStatCardData() {
        ReportResponse response = reportService.getStatCardData();
        ApiResponse<ReportResponse> apiResponse = ApiResponse.<ReportResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
