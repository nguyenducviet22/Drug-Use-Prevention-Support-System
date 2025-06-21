package com.swp.drug_use_prevention_support_system.controllers;


import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/event")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@Valid @RequestBody CreateEventRequest request) {
        EventResponse response = eventService.createEvent(request);
        ApiResponse<EventResponse> apiResponse = ApiResponse.<EventResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() throws IOException {
        List<EventResponse> responses = eventService.getAllEvents();
        ApiResponse<List<EventResponse>> apiResponses = ApiResponse.<List<EventResponse>>builder()
                .data(responses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponses);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getUpcomingEvents() {
        List<EventResponse> upcomingEvents = eventService.getUpcomingEvents();
        ApiResponse<List<EventResponse>> apiResponse = ApiResponse.<List<EventResponse>>builder()
                .data(upcomingEvents)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable UUID id) {
        EventResponse response = eventService.getEvent(id);
        ApiResponse<EventResponse> apiResponse = ApiResponse.<EventResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/manager-events")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getManagerEvents() {
        List<EventResponse> response = eventService.getEventsByStaff();
        ApiResponse<List<EventResponse>> apiResponse = ApiResponse.<List<EventResponse>>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/manager/{username}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByManager(@PathVariable String username) {
        List<EventResponse> eventResponses = eventService.getEventsByStaff(username);
        ApiResponse<List<EventResponse>> apiResponse = ApiResponse.<List<EventResponse>>builder()
                .data(eventResponses)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEventRequest request) {

        EventResponse response = eventService.updateEvent(id, request);
        ApiResponse<EventResponse> apiResponse = ApiResponse.<EventResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEventStatus(@PathVariable UUID id,
                                                                      @RequestParam EventStatus status) {
        EventResponse response = eventService.updateEventStatus(id, status);
        ApiResponse<EventResponse> apiResponse = ApiResponse.<EventResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
