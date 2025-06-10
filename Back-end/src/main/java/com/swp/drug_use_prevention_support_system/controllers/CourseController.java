package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateCourseRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CourseResponse;
import com.swp.drug_use_prevention_support_system.services.CourseService;
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
@RequestMapping("/api/course")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        CourseResponse response = courseService.createCourse(request);
        ApiResponse<CourseResponse> apiResponse = ApiResponse.<CourseResponse>builder()
                .status(HttpStatus.CREATED.value())
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses() {
        List<CourseResponse> responses = courseService.getAllCourses();
        ApiResponse<List<CourseResponse>> apiResponse = ApiResponse.<List<CourseResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable UUID id) {
        CourseResponse response = courseService.getCourse(id);
        ApiResponse<CourseResponse> apiResponse = ApiResponse.<CourseResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(@PathVariable UUID id,
                                                                    @RequestBody UpdateCourseRequest request) {
        CourseResponse response = courseService.updateCourse(id, request);
        ApiResponse<CourseResponse> apiResponse = ApiResponse.<CourseResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> deleteCourse(@PathVariable UUID id) {
        CourseResponse response = courseService.deleteCourse(id);
        ApiResponse<CourseResponse> apiResponse = ApiResponse.<CourseResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importUserDetails(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importCoursesFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Courses into DB");
    }
}
