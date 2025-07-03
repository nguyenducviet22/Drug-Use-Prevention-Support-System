package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AvailabilityResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.services.AvailabilityService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<List<LocalDateTime>>> getConsultantAvailabilities(String username, String from, String to) {
        List<LocalDateTime> responses = availabilityService.getConsultantAvailableSlots(username, from, to);
        ApiResponse<List<LocalDateTime>> apiResponse = ApiResponse.<List<LocalDateTime>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/slots/{status}")
    public ResponseEntity<ApiResponse<List<LocalDateTime>>> getConsultantBookedSlotsByStatus(String username,
                                                                                             String from, String to,
                                                                                             @PathVariable AppointmentStatus status) {
        List<LocalDateTime> responses = availabilityService.getConsultantBookedSlotsByStatus(username, from, to, status);
        ApiResponse<List<LocalDateTime>> apiResponse = ApiResponse.<List<LocalDateTime>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{status}")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> cancelConsultantScheduledSlots(@PathVariable AppointmentStatus status,
                                                                                            @Valid @RequestBody UpdateAvailabilityRequest request) throws MessagingException {
        AvailabilityResponse response = availabilityService.cancelConsultantScheduledSlots(status, request);
        ApiResponse<AvailabilityResponse> apiResponse = ApiResponse.<AvailabilityResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
