package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AppointmentResponse;
import com.swp.drug_use_prevention_support_system.services.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointment")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentResponse response = appointmentService.createAppointment(request);
        ApiResponse<AppointmentResponse> apiResponse = ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.CREATED.value())
                .data(response)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAllAppointments() {
        List<AppointmentResponse> responses = appointmentService.getAllAppointments();
        ApiResponse<List<AppointmentResponse>> apiResponse = ApiResponse.<List<AppointmentResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-list/{username}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMemberAppointments(@PathVariable String username) {
        List<AppointmentResponse> responses = appointmentService.getMemberAppointments(username);
        ApiResponse<List<AppointmentResponse>> apiResponse = ApiResponse.<List<AppointmentResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointment(@PathVariable UUID id) {
        AppointmentResponse response = appointmentService.getAppointment(id);
        ApiResponse<AppointmentResponse> apiResponse = ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(@PathVariable UUID id,
                                                                              @Valid @RequestBody UpdateAppointmentRequest request) {
        AppointmentResponse response = appointmentService.updateAppointment(id, request);
        ApiResponse<AppointmentResponse> apiResponse = ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/today/{username}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getTodayAppointment(@PathVariable String username) {
        AppointmentResponse response = appointmentService.getMyTodayAppointment(username);
        ApiResponse<AppointmentResponse> apiResponse = ApiResponse.<AppointmentResponse>builder()
                .status(HttpStatus.OK.value())
                .data(response)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
