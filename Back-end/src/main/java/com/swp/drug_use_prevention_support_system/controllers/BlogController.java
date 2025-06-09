package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.BlogResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.services.BlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

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

    @GetMapping("/my-list/{username}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getMemberBlogs(@PathVariable String username) {
        List<BlogResponse> responses = blogService.getMemberBlogs(username);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/my-list/{username}")
    public ResponseEntity<ApiResponse<List<BlogResponse>>> getMemberBlogs(@PathVariable String username) {
        List<BlogResponse> responses = blogService.getMemberBlogs(username);
        ApiResponse<List<BlogResponse>> apiResponses = ApiResponse.<List<BlogResponse>>builder()
                .data(responses)
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

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BlogResponse>> updateBlogStatus(@PathVariable UUID id,
                                                                      @RequestParam BlogStatus status) {
        BlogResponse response = blogService.updateBlogStatus(id, status);
        ApiResponse<BlogResponse> apiResponse = ApiResponse.<BlogResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
