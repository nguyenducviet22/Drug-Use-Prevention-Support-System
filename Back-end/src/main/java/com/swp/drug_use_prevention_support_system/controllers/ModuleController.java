package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateModuleRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/module")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<ModuleResponse>> createModule(@Valid @RequestBody CreateModuleRequest request) {
        ModuleResponse response = moduleService.createProduct(request);
        ApiResponse<ModuleResponse> apiResponse = ApiResponse.<ModuleResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ModuleResponse>> getModule(@PathVariable String id) {
        ModuleResponse response = moduleService.getModel(id);
        ApiResponse<ModuleResponse> apiResponse = ApiResponse.<ModuleResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importCourses(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importModulesFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Modules into DB");
    }
}
