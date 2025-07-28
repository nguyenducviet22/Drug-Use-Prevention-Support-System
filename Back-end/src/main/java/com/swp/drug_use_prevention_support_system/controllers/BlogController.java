package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.BlogResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogType;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.services.BlogService;
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
@RequestMapping("api/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<BlogResponse>> createBlog(@Valid @RequestBody CreateBlogRequest request) {
        BlogResponse response = blogService.createBlog(request);
        ApiResponse<BlogResponse> apiResponse = ApiResponse.<BlogResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getBlogs() {
        List<BlogResponse> responses = blogService.getAllBlogs();
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogResponse>> getBlog(@PathVariable UUID id) {
        BlogResponse response = blogService.getBlog(id);
        ApiResponse<BlogResponse> apiResponse = ApiResponse.<BlogResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogResponse>> updateBlog(@PathVariable UUID id,
                                                                @Valid @RequestBody UpdateBlogRequest request) {
        BlogResponse response = blogService.updateBlog(id, request);
        ApiResponse<BlogResponse> apiResponse = ApiResponse.<BlogResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}/{status}")
    public ResponseEntity<ApiResponse<BlogResponse>> updateBlogStatus(@PathVariable UUID id,
                                                                      @PathVariable BlogStatus status) {
        BlogResponse response = blogService.updateBlogStatus(id, status);
        ApiResponse<BlogResponse> apiResponse = ApiResponse.<BlogResponse>builder()
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
        excelService.importBlogsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Blogs into DB");
    }

    @GetMapping("/type")
    public ResponseEntity<ApiResponse<List<String>>> getAllBlogTypes() {
        List<String> types = Arrays.stream(BlogType.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(types)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<String>>> getAllBlogStatuses() {
        List<String> statuses = Arrays.stream(BlogStatus.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(statuses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/age-group/{ageGroup}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getBlogsByAgeGroup(@PathVariable AgeGroup ageGroup) {
        List<BlogResponse> responses = blogService.getBlogsByAgeGroup(ageGroup);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/my-list/{username}/status/{status}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getMyBlogsByStatus(@PathVariable String username,
                                                                              @PathVariable BlogStatus status) {
        List<BlogResponse> responses = blogService.getMyBlogsByStatus(username, status);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/status/{status}/role-except/{role}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getBlogsByStatusExceptRole(@PathVariable BlogStatus status,
                                                                                      @PathVariable Role role) {
        List<BlogResponse> responses = blogService.getBlogsByStatusExceptRole(status, role);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getBlogsByRole(@PathVariable Role role) {
        List<BlogResponse> responses = blogService.getBlogsByRole(role);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/status/{status}/role/{role}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getBlogsByStatusRole(@PathVariable BlogStatus status,
                                                                                @PathVariable Role role) {
        List<BlogResponse> responses = blogService.getBlogsByStatusAndRole(status, role);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getBlogsByStatus(@PathVariable BlogStatus status) {
        List<BlogResponse> responses = blogService.getBlogsByStatus(status);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    //ADMIN HOMEPAGE
    @GetMapping("/admin/stats/blogs")
    public ResponseEntity<Map<String, Object>> getBlogStats() {
        return ResponseEntity.ok(blogService.getBlogStats());
    }

}
