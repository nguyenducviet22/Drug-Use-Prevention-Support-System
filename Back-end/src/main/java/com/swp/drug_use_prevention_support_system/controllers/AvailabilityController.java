package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AvailabilityResponse;
import com.swp.drug_use_prevention_support_system.services.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> createConsultantAvailabilities(@Valid @RequestBody CreateAvailabilityRequest request) {
        List<AvailabilityResponse> responses = availabilityService.createConsultantAvailabilities(request);
        ApiResponse<List<AvailabilityResponse>> apiResponse = ApiResponse.<List<AvailabilityResponse>>builder()
                .status(HttpStatus.CREATED.value())
                .data(responses)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse<List<LocalDateTime>>> getConsultantAvailabilities(String username, LocalDate from, LocalDate to) {
        List<LocalDateTime> responses = availabilityService.getConsultantAvailableSlots(username, from, to);
        ApiResponse<List<LocalDateTime>> apiResponse = ApiResponse.<List<LocalDateTime>>builder()
                .status(HttpStatus.CREATED.value())
                .data(responses)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping("/scheduled-slots")
    public ResponseEntity<ApiResponse<List<LocalDateTime>>> getConsultantScheduledSlots(String username, LocalDate from, LocalDate to) {
        List<LocalDateTime> responses = availabilityService.getConsultantScheduledSlots(username, from, to);
        ApiResponse<List<LocalDateTime>> apiResponse = ApiResponse.<List<LocalDateTime>>builder()
                .status(HttpStatus.CREATED.value())
                .data(responses)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> updateConsultantAvailabilities(@Valid @RequestBody UpdateAvailabilityRequest request) {
        List<AvailabilityResponse> responses = availabilityService.updateConsultantAvailabilities(request);
        ApiResponse<List<AvailabilityResponse>> apiResponse = ApiResponse.<List<AvailabilityResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
