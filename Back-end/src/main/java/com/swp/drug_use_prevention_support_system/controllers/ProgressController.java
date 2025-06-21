package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateProgressRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CheckResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ProgressResponse;
import com.swp.drug_use_prevention_support_system.services.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProgressResponse>> createProgress(@Valid @RequestBody CreateProgressRequest request) {
        ProgressResponse response = progressService.createLessonProgress(request);
        ApiResponse<ProgressResponse> apiResponse = ApiResponse.<ProgressResponse>builder()
                .status(HttpStatus.CREATED.value())
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/enrollment/{enrollmentID}")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getProgressesForEnrollment(@PathVariable UUID enrollmentID) {
        List<ProgressResponse> responses = progressService.getProgressesForEnrollment(enrollmentID);
        ApiResponse<List<ProgressResponse>> apiResponse = ApiResponse.<List<ProgressResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgressResponse>> completeLessonProgress(@PathVariable UUID id) {
        ProgressResponse response = progressService.completeLessonProgress(id);
        ApiResponse<ProgressResponse> apiResponse = ApiResponse.<ProgressResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/course-completion")
    public ResponseEntity<ApiResponse<CheckResponse>> getCourseCompletionPercentage(@RequestParam UUID enrollmentID,
                                                                                    @RequestParam UUID courseID) {
        double percentage = progressService.calculateCourseCompletionPercentage(enrollmentID, courseID);
        CheckResponse response = CheckResponse.builder()
                .completion(percentage)
                .build();
        ApiResponse<CheckResponse> apiResponse = ApiResponse.<CheckResponse>builder()
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProgressResponse>> getProgress(@RequestParam UUID enrollmentID,
                                                                     @RequestParam UUID lessonID) {
        ProgressResponse response = progressService.getProgress(enrollmentID, lessonID);
        ApiResponse<ProgressResponse> apiResponse = ApiResponse.<ProgressResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
