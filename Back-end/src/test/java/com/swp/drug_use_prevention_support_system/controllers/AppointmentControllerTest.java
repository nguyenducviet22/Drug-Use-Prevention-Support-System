package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AppointmentResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CheckResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.services.AppointmentService;
import jakarta.mail.MessagingException;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppointmentControllerTest {

    @Mock
    private AppointmentService appointmentService;

    @InjectMocks
    private AppointmentController appointmentController;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. createAppointment tests ---
    @Test
    void testCreateAppointment_Success() throws GeneralSecurityException, IOException {
        String appointmentDateTime = LocalDateTime.now().plusHours(1).format(formatter);
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .notes("Consultation notes")
                .appointmentDateTime(appointmentDateTime)
                .consultantID("consultant1")
                .build();
        AppointmentResponse mockResponse = AppointmentResponse.builder()
                .appointmentID(UUID.randomUUID())
                .notes("Consultation notes")
                .appointmentDateTime(appointmentDateTime)
                .build();
        when(appointmentService.createAppointment(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AppointmentResponse>> response = appointmentController.createAppointment(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Consultation notes", response.getBody().getData().getNotes());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(appointmentService).createAppointment(request);
    }

    @Test
    void testCreateAppointment_InvalidInput() throws GeneralSecurityException, IOException {
        // Missing required fields: appointmentDateTime, consultantID
        CreateAppointmentRequest invalidRequest = CreateAppointmentRequest.builder()
                .notes("Invalid notes")
                .build();

        // Simulate validation error from service layer or controller's @Valid
        when(appointmentService.createAppointment(invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> appointmentController.createAppointment(invalidRequest));
        verify(appointmentService).createAppointment(invalidRequest);
    }

    @Test
    void testCreateAppointment_GeneralSecurityException() throws GeneralSecurityException, IOException {
        String appointmentDateTime = LocalDateTime.now().plusHours(1).format(formatter);
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .notes("Consultation notes")
                .appointmentDateTime(appointmentDateTime)
                .consultantID("consultant1")
                .build();
        when(appointmentService.createAppointment(request)).thenThrow(new GeneralSecurityException("Security error"));

        Exception exception = assertThrows(GeneralSecurityException.class, () -> appointmentController.createAppointment(request));
        assertTrue(exception.getMessage().contains("Security error"));
        verify(appointmentService).createAppointment(request);
    }

    @Test
    void testCreateAppointment_IOException() throws GeneralSecurityException, IOException {
        String appointmentDateTime = LocalDateTime.now().plusHours(1).format(formatter);
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .notes("Consultation notes")
                .appointmentDateTime(appointmentDateTime)
                .consultantID("consultant1")
                .build();
        when(appointmentService.createAppointment(request)).thenThrow(new IOException("IO error"));

        Exception exception = assertThrows(IOException.class, () -> appointmentController.createAppointment(request));
        assertTrue(exception.getMessage().contains("IO error"));
        verify(appointmentService).createAppointment(request);
    }

    // --- 2. getAllAppointments tests ---
    @Test
    void testGetAllAppointments_Success() {
        List<AppointmentResponse> mockList = Arrays.asList(
                AppointmentResponse.builder().notes("Appt1").build(),
                AppointmentResponse.builder().notes("Appt2").build()
        );
        when(appointmentService.getAllAppointments()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getAllAppointments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(appointmentService).getAllAppointments();
    }

    @Test
    void testGetAllAppointments_NoAppointmentsFound() {
        when(appointmentService.getAllAppointments()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getAllAppointments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(appointmentService).getAllAppointments();
    }

    // --- 3. getMemberAppointments tests ---
    @Test
    void testGetMemberAppointments_Success() {
        String username = "memberUser";
        List<AppointmentResponse> mockList = Arrays.asList(
                AppointmentResponse.builder().notes("Member Appt 1").build(),
                AppointmentResponse.builder().notes("Member Appt 2").build()
        );
        when(appointmentService.getMemberAppointments(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getMemberAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(appointmentService).getMemberAppointments(username);
    }

    @Test
    void testGetMemberAppointments_NoAppointmentsForMember() {
        String username = "memberUser";
        when(appointmentService.getMemberAppointments(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getMemberAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(appointmentService).getMemberAppointments(username);
    }

    @Test
    void testGetMemberAppointments_MemberNotFound() {
        String nonExistentUsername = "nonExistentMember";
        when(appointmentService.getMemberAppointments(nonExistentUsername)).thenThrow(new NoSuchElementException("Member not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> appointmentController.getMemberAppointments(nonExistentUsername));
        assertTrue(exception.getMessage().contains("Member not found"));
        verify(appointmentService).getMemberAppointments(nonExistentUsername);
    }


    // --- 4. getConsultantAppointments tests ---
    @Test
    void testGetConsultantAppointments_Success() {
        String username = "consultantUser";
        List<AppointmentResponse> mockList = Arrays.asList(
                AppointmentResponse.builder().notes("Consultant Appt 1").build(),
                AppointmentResponse.builder().notes("Consultant Appt 2").build()
        );
        when(appointmentService.getConsultantAppointments(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getConsultantAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(appointmentService).getConsultantAppointments(username);
    }

    @Test
    void testGetConsultantAppointments_NoAppointmentsForConsultant() {
        String username = "consultantUser";
        when(appointmentService.getConsultantAppointments(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getConsultantAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(appointmentService).getConsultantAppointments(username);
    }

    @Test
    void testGetConsultantAppointments_ConsultantNotFound() {
        String nonExistentUsername = "nonExistentConsultant";
        when(appointmentService.getConsultantAppointments(nonExistentUsername)).thenThrow(new NoSuchElementException("Consultant not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> appointmentController.getConsultantAppointments(nonExistentUsername));
        assertTrue(exception.getMessage().contains("Consultant not found"));
        verify(appointmentService).getConsultantAppointments(nonExistentUsername);
    }

    // --- 5. getAppointment tests ---
    @Test
    void testGetAppointment_Success() {
        UUID id = UUID.randomUUID();
        AppointmentResponse mockResponse = AppointmentResponse.builder().appointmentID(id).notes("Specific Appt").build();
        when(appointmentService.getAppointment(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AppointmentResponse>> response = appointmentController.getAppointment(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getAppointmentID());
        verify(appointmentService).getAppointment(id);
    }

    @Test
    void testGetAppointment_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(appointmentService.getAppointment(nonExistentId)).thenThrow(new NoSuchElementException("Appointment not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> appointmentController.getAppointment(nonExistentId));
        assertTrue(exception.getMessage().contains("Appointment not found"));
        verify(appointmentService).getAppointment(nonExistentId);
    }

    // --- 6. updateAppointment tests ---
    @Test
    void testUpdateAppointment_Success() {
        UUID id = UUID.randomUUID();
        String appointmentDateTime = LocalDateTime.now().plusDays(1).format(formatter);
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .notes("Updated Description")
                .status(AppointmentStatus.SCHEDULED)
                .appointmentDateTime(appointmentDateTime)
                .build();
        AppointmentResponse updatedResponse = AppointmentResponse.builder()
                .appointmentID(id)
                .notes("Updated Description")
                .status(AppointmentStatus.SCHEDULED)
                .appointmentDateTime(appointmentDateTime)
                .build();
        when(appointmentService.updateAppointment(id, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<AppointmentResponse>> response = appointmentController.updateAppointment(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Description", response.getBody().getData().getNotes());
        assertEquals(AppointmentStatus.SCHEDULED, response.getBody().getData().getStatus());
        verify(appointmentService).updateAppointment(id, request);
    }

    @Test
    void testUpdateAppointment_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        String appointmentDateTime = LocalDateTime.now().plusDays(1).format(formatter);
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .notes("Update")
                .status(AppointmentStatus.SCHEDULED)
                .appointmentDateTime(appointmentDateTime)
                .build();
        when(appointmentService.updateAppointment(nonExistentId, request)).thenThrow(new NoSuchElementException("Appointment to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> appointmentController.updateAppointment(nonExistentId, request));
        assertTrue(exception.getMessage().contains("Appointment to update not found"));
        verify(appointmentService).updateAppointment(nonExistentId, request);
    }

    @Test
    void testUpdateAppointment_InvalidInput() {
        UUID id = UUID.randomUUID();
        // Missing required fields: notes, status, appointmentDateTime
        UpdateAppointmentRequest invalidRequest = UpdateAppointmentRequest.builder().build();

        when(appointmentService.updateAppointment(id, invalidRequest)).thenThrow(new ConstraintViolationException("Validation failed", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> appointmentController.updateAppointment(id, invalidRequest));
        verify(appointmentService).updateAppointment(id, invalidRequest);
    }

    // --- 7. getMemberTodayAppointments tests ---
    @Test
    void testGetMemberTodayAppointments_Success() {
        String username = "memberToday";
        List<AppointmentResponse> mockList = Collections.singletonList(
                AppointmentResponse.builder().notes("Today's Appt").build()
        );
        when(appointmentService.getMemberTodayAppointments(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getMemberTodayAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getData().size());
        verify(appointmentService).getMemberTodayAppointments(username);
    }

    @Test
    void testGetMemberTodayAppointments_NoTodayAppointmentsForMember() {
        String username = "memberNoToday";
        when(appointmentService.getMemberTodayAppointments(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getMemberTodayAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(appointmentService).getMemberTodayAppointments(username);
    }

    // --- 8. getConsultantTodayAppointments tests ---
    @Test
    void testGetConsultantTodayAppointments_Success() {
        String username = "consultantToday";
        List<AppointmentResponse> mockList = Collections.singletonList(
                AppointmentResponse.builder().notes("Consultant Today's Appt").build()
        );
        when(appointmentService.getConsultantTodayAppointments(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getConsultantTodayAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getData().size());
        verify(appointmentService).getConsultantTodayAppointments(username);
    }

    @Test
    void testGetConsultantTodayAppointments_NoTodayAppointmentsForConsultant() {
        String username = "consultantNoToday";
        when(appointmentService.getConsultantTodayAppointments(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<AppointmentResponse>>> response = appointmentController.getConsultantTodayAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(appointmentService).getConsultantTodayAppointments(username);
    }

    // --- 9. countConsultantAppointments tests ---
    @Test
    void testCountConsultantAppointments_Success() {
        String username = "consultantCounts";
        long totalAppts = 5;
        long totalMembers = 3;
        when(appointmentService.countConsultantAppointments(username)).thenReturn(totalAppts);
        when(appointmentService.countTotalMembersOfConsultant(username)).thenReturn(totalMembers);

        ResponseEntity<ApiResponse<CheckResponse>> response = appointmentController.countConsultantAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(totalAppts, response.getBody().getData().getTotalConsultantAppointments());
        assertEquals(totalMembers, response.getBody().getData().getTotalMembersOfConsultant());
        verify(appointmentService).countConsultantAppointments(username);
        verify(appointmentService).countTotalMembersOfConsultant(username);
    }

    @Test
    void testCountConsultantAppointments_NoAppointmentsOrMembers() {
        String username = "consultantZero";
        when(appointmentService.countConsultantAppointments(username)).thenReturn(0L);
        when(appointmentService.countTotalMembersOfConsultant(username)).thenReturn(0L);

        ResponseEntity<ApiResponse<CheckResponse>> response = appointmentController.countConsultantAppointments(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0L, response.getBody().getData().getTotalConsultantAppointments());
        assertEquals(0L, response.getBody().getData().getTotalMembersOfConsultant());
        verify(appointmentService).countConsultantAppointments(username);
        verify(appointmentService).countTotalMembersOfConsultant(username);
    }

    // --- 10. getMemberBookedAppointmentByStatus tests ---
    @Test
    void testGetMemberBookedAppointmentByStatus_Success() {
        String username = "memberBooked";
        String from = "2024-01-01";
        String to = "2024-01-31";
        AppointmentStatus status = AppointmentStatus.SCHEDULED;
        List<LocalDateTime> mockList = Arrays.asList(
                LocalDateTime.of(2024, 1, 15, 10, 0),
                LocalDateTime.of(2024, 1, 20, 14, 30)
        );
        when(appointmentService.getMemberBookedAppointmentByStatus(username, from, to, status)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<LocalDateTime>>> response = appointmentController.getMemberBookedAppointmentByStatus(username, from, to, status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(appointmentService).getMemberBookedAppointmentByStatus(username, from, to, status);
    }

    @Test
    void testGetMemberBookedAppointmentByStatus_NoAppointmentsFound() {
        String username = "memberNoBooked";
        String from = "2024-01-01";
        String to = "2024-01-31";
        AppointmentStatus status = AppointmentStatus.COMPLETED;
        when(appointmentService.getMemberBookedAppointmentByStatus(username, from, to, status)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<LocalDateTime>>> response = appointmentController.getMemberBookedAppointmentByStatus(username, from, to, status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(appointmentService).getMemberBookedAppointmentByStatus(username, from, to, status);
    }

    @Test
    void testGetMemberBookedAppointmentByStatus_InvalidDateRange() {
        String username = "memberInvalidDate";
        String from = "invalid-date"; // Invalid format
        String to = "2024-01-31";
        AppointmentStatus status = AppointmentStatus.SCHEDULED;

        // Assuming service would throw an exception for invalid date format
        when(appointmentService.getMemberBookedAppointmentByStatus(username, from, to, status))
                .thenThrow(new IllegalArgumentException("Invalid date format"));

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                appointmentController.getMemberBookedAppointmentByStatus(username, from, to, status));
        assertTrue(exception.getMessage().contains("Invalid date format"));
        verify(appointmentService).getMemberBookedAppointmentByStatus(username, from, to, status);
    }

    // --- 11. cancelBookedAppointment tests ---
    @Test
    void testCancelBookedAppointment_Success() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        // The UpdateAppointmentRequest in this endpoint takes a status and the request body contains other details.
        // It's not clear from the method signature if the ID should be in the path or body, but given it's @RequestBody,
        // we'll assume the ID is passed in the request body.
        String appointmentDateTime = LocalDateTime.now().format(formatter); // Example
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .notes("Cancelled by member")
                .status(status) // Status from path variable, but also present in request body
                .appointmentDateTime(appointmentDateTime)
                .build();
        AppointmentResponse mockResponse = AppointmentResponse.builder()
                .notes("Cancelled by member")
                .status(AppointmentStatus.CANCELLED)
                .appointmentDateTime(appointmentDateTime)
                .build();
        when(appointmentService.cancelMemberScheduledAppointment(status, request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<AppointmentResponse>> response = appointmentController.cancelBookedAppointment(status, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(AppointmentStatus.CANCELLED, response.getBody().getData().getStatus());
        verify(appointmentService).cancelMemberScheduledAppointment(status, request);
    }

    @Test
    void testCancelBookedAppointment_NotFound() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        String appointmentDateTime = LocalDateTime.now().format(formatter);
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .notes("Attempt to cancel non-existent")
                .status(status)
                .appointmentDateTime(appointmentDateTime)
                .build();
        when(appointmentService.cancelMemberScheduledAppointment(status, request)).thenThrow(new NoSuchElementException("Appointment not found for cancellation"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> appointmentController.cancelBookedAppointment(status, request));
        assertTrue(exception.getMessage().contains("Appointment not found for cancellation"));
        verify(appointmentService).cancelMemberScheduledAppointment(status, request);
    }

    @Test
    void testCancelBookedAppointment_MessagingException() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.CANCELLED;
        String appointmentDateTime = LocalDateTime.now().format(formatter);
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .notes("Attempt to cancel with email failure")
                .status(status)
                .appointmentDateTime(appointmentDateTime)
                .build();
        when(appointmentService.cancelMemberScheduledAppointment(status, request)).thenThrow(new MessagingException("Failed to send email"));

        Exception exception = assertThrows(MessagingException.class, () -> appointmentController.cancelBookedAppointment(status, request));
        assertTrue(exception.getMessage().contains("Failed to send email"));
        verify(appointmentService).cancelMemberScheduledAppointment(status, request);
    }

    @Test
    void testCancelBookedAppointment_InvalidStatusOrRequest() throws MessagingException {
        AppointmentStatus status = AppointmentStatus.COMPLETED; // Invalid status for cancellation context
        String appointmentDateTime = LocalDateTime.now().format(formatter);
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .notes("Attempt to cancel completed appointment")
                .status(status)
                .appointmentDateTime(appointmentDateTime)
                .build();
        when(appointmentService.cancelMemberScheduledAppointment(status, request))
                .thenThrow(new IllegalArgumentException("Cannot cancel a completed appointment"));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> appointmentController.cancelBookedAppointment(status, request));
        assertTrue(exception.getMessage().contains("Cannot cancel a completed appointment"));
        verify(appointmentService).cancelMemberScheduledAppointment(status, request);
    }
}