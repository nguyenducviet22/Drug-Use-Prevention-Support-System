package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventStatusResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.services.EventService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/event")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;
    private final ExcelService excelService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@Valid @RequestBody CreateEventRequest request) {
        EventResponse response = eventService.createEvent(request);
        ApiResponse<EventResponse> apiResponse = ApiResponse.<EventResponse>builder()
                .data(response)
                .status(HttpStatus.CREATED.value())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<EventResponse>> saveEventAsDraft(@Valid @RequestBody CreateEventRequest request) {
        EventResponse response = eventService.saveEventAsDraft(request);
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
                .message("Event updated successfully")
                .status(HttpStatus.OK.value())
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}/{status}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEventStatus(@PathVariable UUID id,
                                                                        @PathVariable EventStatus status) {
        EventResponse response = eventService.updateEventStatus(id, status);
        ApiResponse<EventResponse> apiResponse = ApiResponse.<EventResponse>builder()
                .data(response)
                .status(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    //Đăng kí tham gia sự kiện
    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<String>> registerEvent(@PathVariable UUID id) {
        eventService.registerUserToEvent(id);

        ApiResponse<String> response = ApiResponse.<String>builder()
                .data("Registered successfully")
                .status(HttpStatus.OK.value())
                .build();

        return ResponseEntity.ok(response);
    }

    //Hủy đăng kí tham gia sự kiện
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelRegistration(@PathVariable UUID id) {
        eventService.cancelEventRegistration(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<EventStatusResponse> getEventStatus(@PathVariable UUID id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        EventStatusResponse response = eventService.getEventStatus(id, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/age-group")
    public ResponseEntity<List<EventResponse>> getEventsByUserAgeGroup() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<EventResponse> events = eventService.getEventsForCurrentUser(username);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/age-group/{ageGroup}")
    public ResponseEntity<List<EventResponse>> getEventsByAgeGroup(@PathVariable AgeGroup ageGroup) {
        List<EventResponse> events = eventService.getEventsByAgeGroup(ageGroup);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/my-events/{memberId}")
    public List<EventResponse> getMyEvents(@PathVariable String memberId) {
        return eventService.getEventsByMember(memberId);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<String> importEventsFromExcel(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        excelService.importEventsFromExcel(file.getInputStream());
        return ResponseEntity.ok("Excel file data saved Events into DB");
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByStatus(@PathVariable EventStatus status) {
        List<EventResponse> responses = eventService.getEventsByStatus(status);
        ApiResponse<List<EventResponse>> apiResponse = ApiResponse.<List<EventResponse>>builder()
                .status(HttpStatus.OK.value())
                .data(responses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<String>>> getAllEventStatuses() {
        List<String> statuses = Arrays.stream(EventStatus.values())
                .map(Enum::name)
                .toList();
        ApiResponse<List<String>> apiResponse = ApiResponse.<List<String>>builder()
                .status(HttpStatus.OK.value())
                .data(statuses)
                .build();
        return ResponseEntity.ok(apiResponse);
    }
}
