package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteLessonsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.DeleteModulesRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateLessonRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.LessonResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ModuleResponse;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import com.swp.drug_use_prevention_support_system.services.LessonService;
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
@RequestMapping("/api/lesson")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(@Valid @RequestBody CreateLessonRequest request) {
        LessonResponse response = lessonService.createLesson(request);
        ApiResponse<LessonResponse> apiResponse = ApiResponse.<LessonResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(@PathVariable UUID id) {
        LessonResponse response = lessonService.getLesson(id);
        ApiResponse<LessonResponse> apiResponse = ApiResponse.<LessonResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(@PathVariable UUID id,
                                                                    @Valid @RequestBody UpdateLessonRequest request) {
        LessonResponse response = lessonService.updateLesson(id, request);
        ApiResponse<LessonResponse> apiResponse = ApiResponse.<LessonResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{moduleID}/unavailable")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> updateModulesStatus(@PathVariable UUID moduleID,
                                                                                 @RequestBody DeleteLessonsRequest request) {
        List<LessonResponse> responses = lessonService.updateLessonsStatus(moduleID, request);
        ApiResponse<List<LessonResponse>> apiResponse = ApiResponse.<List<LessonResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importCourses(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importLessonsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Lessons into DB");
    }
}
