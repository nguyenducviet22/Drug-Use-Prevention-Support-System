package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AvailabilityResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.services.AvailabilityService;
import jakarta.mail.MessagingException;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AvailabilityControllerTest {

    @Mock
    private AvailabilityService availabilityService;

    @InjectMocks
    private AvailabilityController availabilityController;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createConsultantAvailabilities tests ---
    @Test
    void testCreateConsultantAvailabilities_Success() {
        List<String> dateTimeStrings = Arrays.asList(
                LocalDateTime.now().plusDays(1).format(formatter),
                LocalDateTime.now().plusDays(2).format(formatter)
        );
        CreateAvailabilityRequest request = CreateAvailabilityRequest.builder()
                .availabilityDateTimes(dateTimeStrings)
                .build();
        List<AvailabilityResponse> mockResponses = Arrays.asList(
                AvailabilityResponse.builder().availabilityID(UUID.randomUUID()).status(AppointmentStatus.SCHEDULED).build(),
                AvailabilityResponse.builder().availabilityID(UUID.randomUUID()).status(AppointmentStatus.SCHEDULED).build()
        );
        when(availabilityService.createConsultantAvailabilities(request)).thenReturn(mockResponses);

        ResponseEntity<ApiResponse<List<AvailabilityResponse>>> responseEntity = availabilityController.createConsultantAvailabilities(request);

        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(2, responseEntity.getBody().getData().size());
        assertEquals(HttpStatus.CREATED.value(), responseEntity.getBody().getStatus());
        verify(availabilityService).createConsultantAvailabilities(request);
    }

    @Test
    void testCreateConsultantAvailabilities_InvalidInput() {
        // Test with null availabilityDateTimes
        CreateAvailabilityRequest requestWithNullList = CreateAvailabilityRequest.builder().availabilityDateTimes(null).build();
        when(availabilityService.createConsultantAvailabilities(requestWithNullList))
                .thenThrow(new ConstraintViolationException("Availability date and time is required", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> availabilityController.createConsultantAvailabilities(requestWithNullList));
        verify(availabilityService).createConsultantAvailabilities(requestWithNullList);

        // Test with empty availabilityDateTimes
        CreateAvailabilityRequest requestWithEmptyList = CreateAvailabilityRequest.builder().availabilityDateTimes(Collections.emptyList()).build();
        when(availabilityService.createConsultantAvailabilities(requestWithEmptyList))
                .thenThrow(new ConstraintViolationException("Availability date and time is required", Collections.emptySet()));
        assertThrows(ConstraintViolationException.class, () -> availabilityController.createConsultantAvailabilities(requestWithEmptyList));
        verify(availabilityService, times(2)).createConsultantAvailabilities(any(CreateAvailabilityRequest.class)); // Called twice
    }

    @Test
    void testCreateConsultantAvailabilities_ServiceException() {
        List<String> dateTimeStrings = Arrays.asList(LocalDateTime.now().plusDays(1).format(formatter));
        CreateAvailabilityRequest request = CreateAvailabilityRequest.builder().availabilityDateTimes(dateTimeStrings).build();
        when(availabilityService.createConsultantAvailabilities(request))
                .thenThrow(new RuntimeException("Database error during creation"));

        Exception exception = assertThrows(RuntimeException.class, () -> availabilityController.createConsultantAvailabilities(request));
        assertTrue(exception.getMessage().contains("Database error during creation"));
        verify(availabilityService).createConsultantAvailabilities(request);
    }

    // --- 2. getConsultantAvailabilities tests ---
    @Test
    void testGetConsultantAvailabilities_Success() {
        String username = "consultant1";
        String from = "2024-07-15";
        String to = "2024-07-20";
        List<LocalDateTime> mockResponses = Arrays.asList(
                LocalDateTime.of(2024, 7, 16, 9, 0),
                LocalDateTime.of(2024, 7, 17, 10, 0)
        );
        when(availabilityService.getConsultantAvailableSlots(username, from, to)).thenReturn(mockResponses);

        ResponseEntity<ApiResponse<List<LocalDateTime>>> responseEntity = availabilityController.getConsultantAvailabilities(username, from, to);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(2, responseEntity.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(availabilityService).getConsultantAvailableSlots(username, from, to);
    }

    @Test
    void testGetConsultantAvailabilities_NoSlotsFound() {
        String username = "consultant2";
        String from = "2024-07-15";
        String to = "2024-07-20";
        when(availabilityService.getConsultantAvailableSlots(username, from, to)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<LocalDateTime>>> responseEntity = availabilityController.getConsultantAvailabilities(username, from, to);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(availabilityService).getConsultantAvailableSlots(username, from, to);
    }

    @Test
    void testGetConsultantAvailabilities_InvalidDateRange() {
        String username = "consultant3";
        String from = "invalid-date";
        String to = "2024-07-20";
        when(availabilityService.getConsultantAvailableSlots(username, from, to))
                .thenThrow(new IllegalArgumentException("Invalid date format"));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> availabilityController.getConsultantAvailabilities(username, from, to));
        assertTrue(exception.getMessage().contains("Invalid date format"));
        verify(availabilityService).getConsultantAvailableSlots(username, from, to);
    }

    // --- 3. getConsultantBookedSlotsByStatus tests ---
    @Test
    void testGetConsultantBookedSlotsByStatus_Success() {
        String username = "consultantBooked";
        String from = "2024-07-01";
        String to = "2024-07-31";
        AppointmentStatus status = AppointmentStatus.SCHEDULED;
        List<LocalDateTime> mockResponses = Arrays.asList(
                LocalDateTime.of(2024, 7, 10, 11, 0),
                LocalDateTime.of(2024, 7, 12, 13, 0)
        );
        when(availabilityService.getConsultantBookedSlotsByStatus(username, from, to, status)).thenReturn(mockResponses);

        ResponseEntity<ApiResponse<List<LocalDateTime>>> responseEntity = availabilityController.getConsultantBookedSlotsByStatus(username, from, to, status);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(2, responseEntity.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(availabilityService).getConsultantBookedSlotsByStatus(username, from, to, status);
    }

    @Test
    void testGetConsultantBookedSlotsByStatus_NoBookedSlotsFound() {
        String username = "consultantNoBooked";
        String from = "2024-07-01";
        String to = "2024-07-31";
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        when(availabilityService.getConsultantBookedSlotsByStatus(username, from, to, status)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<LocalDateTime>>> responseEntity = availabilityController.getConsultantBookedSlotsByStatus(username, from, to, status);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(availabilityService).getConsultantBookedSlotsByStatus(username, from, to, status);
    }

    @Test
    void testGetConsultantBookedSlotsByStatus_InvalidStatusOrCriteria() {
        String username = "consultantInvalid";
        String from = "2024-07-01";
        String to = "invalid-to-date";
        AppointmentStatus status = AppointmentStatus.COMPLETED;
        when(availabilityService.getConsultantBookedSlotsByStatus(username, from, to, status))
                .thenThrow(new IllegalArgumentException("Invalid date range format"));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> availabilityController.getConsultantBookedSlotsByStatus(username, from, to, status));
        assertTrue(exception.getMessage().contains("Invalid date range format"));
        verify(availabilityService).getConsultantBookedSlotsByStatus(username, from, to, status);
    }

    // --- 4. cancelConsultantScheduledSlots tests ---
    @Test
    void testCancelConsultantScheduledSlots_Success() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        String availabilityDateTime = LocalDateTime.now().plusDays(5).format(formatter);
        UpdateAvailabilityRequest request = UpdateAvailabilityRequest.builder()
                .availabilityDateTime(availabilityDateTime)
                .reason("Doctor sick leave")
                .build();
        AvailabilityResponse mockResponse = AvailabilityResponse.builder()
                .availabilityID(UUID.randomUUID())
                .status(status)
                .appointmentDateTime(Collections.singletonList(availabilityDateTime))
                .build();
        when(availabilityService.cancelConsultantScheduledSlots(status, request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AvailabilityResponse>> responseEntity = availabilityController.cancelConsultantScheduledSlots(status, request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(status, responseEntity.getBody().getData().getStatus());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(availabilityService).cancelConsultantScheduledSlots(status, request);
    }

    @Test
    void testCancelConsultantScheduledSlots_NotFound() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        String availabilityDateTime = LocalDateTime.now().plusDays(5).format(formatter);
        UpdateAvailabilityRequest request = UpdateAvailabilityRequest.builder()
                .availabilityDateTime(availabilityDateTime)
                .reason("Not found slot")
                .build();
        when(availabilityService.cancelConsultantScheduledSlots(status, request))
                .thenThrow(new NoSuchElementException("Availability slot not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> availabilityController.cancelConsultantScheduledSlots(status, request));
        assertTrue(exception.getMessage().contains("Availability slot not found"));
        verify(availabilityService).cancelConsultantScheduledSlots(status, request);
    }

    @Test
    void testCancelConsultantScheduledSlots_MessagingException() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        String availabilityDateTime = LocalDateTime.now().plusDays(5).format(formatter);
        UpdateAvailabilityRequest request = UpdateAvailabilityRequest.builder()
                .availabilityDateTime(availabilityDateTime)
                .reason("Email service down")
                .build();
        when(availabilityService.cancelConsultantScheduledSlots(status, request))
                .thenThrow(new MessagingException("Failed to send cancellation email"));

        Exception exception = assertThrows(MessagingException.class, () -> availabilityController.cancelConsultantScheduledSlots(status, request));
        assertTrue(exception.getMessage().contains("Failed to send cancellation email"));
        verify(availabilityService).cancelConsultantScheduledSlots(status, request);
    }

    @Test
    void testCancelConsultantScheduledSlots_InvalidRequest() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        // Missing required fields: availabilityDateTime, reason
        UpdateAvailabilityRequest invalidRequest = UpdateAvailabilityRequest.builder().build();

        when(availabilityService.cancelConsultantScheduledSlots(status, invalidRequest))
                .thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> availabilityController.cancelConsultantScheduledSlots(status, invalidRequest));
        verify(availabilityService).cancelConsultantScheduledSlots(status, invalidRequest);
    }
}