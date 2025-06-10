package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateQualificationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.QualificationResponse;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.QualificationService;
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
@RequestMapping("/api/qualification")
@RequiredArgsConstructor
public class QualificationController {

    private final QualificationService qualificationService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<QualificationResponse>> createQualification(@Valid @RequestBody CreateQualificationRequest request) {
        QualificationResponse response = qualificationService.createQualification(request);
        ApiResponse<QualificationResponse> apiResponse = ApiResponse.<QualificationResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QualificationResponse>>> getAllQualifications() {
        List<QualificationResponse> responses = qualificationService.getAllQualifications();
        ApiResponse<List<QualificationResponse>> apiResponse = ApiResponse.<List<QualificationResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-list/{username}")
    public ResponseEntity<ApiResponse<List<QualificationResponse>>> getConsultantQualifications(@PathVariable String username) {
        List<QualificationResponse> responses = qualificationService.getConsultantQualifications(username);
        ApiResponse<List<QualificationResponse>> apiResponse = ApiResponse.<List<QualificationResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QualificationResponse>> getQualification(@PathVariable UUID id) {
        QualificationResponse response = qualificationService.getQualification(id);
        ApiResponse<QualificationResponse> apiResponse = ApiResponse.<QualificationResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QualificationResponse>> updateQualification(@PathVariable UUID id,
                                                                                  @Valid @RequestBody UpdateQualificationRequest request) {
        QualificationResponse response = qualificationService.updateQualification(id, request);
        ApiResponse<QualificationResponse> apiResponse = ApiResponse.<QualificationResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<QualificationResponse>> deleteQualification(@PathVariable UUID id) {
        QualificationResponse response = qualificationService.deleteQualification(id);
        ApiResponse<QualificationResponse> apiResponse = ApiResponse.<QualificationResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importUserDetails(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importQualificationsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Qualifications into DB");
    }
}
