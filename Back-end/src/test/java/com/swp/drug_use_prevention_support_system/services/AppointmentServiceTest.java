package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.MailBody;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AppointmentResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import com.swp.drug_use_prevention_support_system.domain.entities.Availability;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.AppointmentMapper;
import com.swp.drug_use_prevention_support_system.repositories.AppointmentRepository;
import com.swp.drug_use_prevention_support_system.repositories.AvailabilityRepository;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.*;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private AppointmentMapper appointmentMapper;
    @Mock
    private UserService userService;
    @Mock
    private GoogleCalendarService googleCalendarService;
    @Mock
    private AvailabilityService availabilityService;
    @Mock
    private AvailabilityRepository availabilityRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AppointmentService appointmentService;

    private final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Mock SecurityContextHolder for authenticated user
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("testMember", "password", Collections.emptyList()));
    }

    // --- 1. createAppointment tests ---
    @Test
    void testCreateAppointment_Success() throws GeneralSecurityException, IOException {
        // Arrange
        // Create an AppointmentRequest with valid data
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .appointmentDateTime(Instant.now().plus(Duration.ofDays(1)).toString())
                .consultantID("consultant1")
                .notes("Initial notes")
                .build();

        // Mock Appointment and User entities
        Appointment appointment = new Appointment();
        User member = new User();
        member.setUsername("testMember");
        member.setEmail("member@example.com");
        member.setFullName("Test Member");

        User consultant = new User();
        consultant.setUsername("consultant1");
        consultant.setEmail("consultant@example.com");
        consultant.setFullName("Consultant One");

        // Create the expected AppointmentResponse, now reflecting the fuller UserResponse
        AppointmentResponse expectedResponse = AppointmentResponse.builder()
                .appointmentID(UUID.randomUUID())
                .status(AppointmentStatus.SCHEDULED)
                .member(UserResponse.builder() // Build full UserResponse for member
                        .username("testMember")
                        .email("member@example.com")
                        .fullName("Test Member")
                        .build())
                .consultant(UserResponse.builder() // Build full UserResponse for consultant
                        .username("consultant1")
                        .email("consultant@example.com")
                        .fullName("Consultant One")
                        .build())
                .build();

        // Mock behaviors of dependencies
        when(appointmentMapper.toEntity(request)).thenReturn(appointment);
        when(googleCalendarService.createGGMeetAppointment(request)).thenReturn("http://meet.google.com/link");
        when(userService.getLoginUsername()).thenReturn("testMember");
        when(userService.getUserEntity("testMember")).thenReturn(member);
        when(userService.getUserEntity("consultant1")).thenReturn(consultant);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(expectedResponse);
        doNothing().when(availabilityService).confirmConsultantScheduledSlots(anyString(), any(Instant.class), any(AppointmentStatus.class));

        // Act
        AppointmentResponse actualResponse = appointmentService.createAppointment(request);

        // Assert
        // Verify the overall response structure
        assertNotNull(actualResponse);
        assertEquals(expectedResponse.getAppointmentID(), actualResponse.getAppointmentID());
        assertEquals(AppointmentStatus.SCHEDULED, actualResponse.getStatus());

        // Verify member details using the updated UserResponse structure
        assertNotNull(actualResponse.getMember());
        assertEquals("testMember", actualResponse.getMember().getUsername());
        assertEquals("member@example.com", actualResponse.getMember().getEmail());
        assertEquals("Test Member", actualResponse.getMember().getFullName());
        // Add assertions for other member fields if relevant to the test

        // Verify consultant details using the updated UserResponse structure
        assertNotNull(actualResponse.getConsultant());
        assertEquals("consultant1", actualResponse.getConsultant().getUsername());
        assertEquals("consultant@example.com", actualResponse.getConsultant().getEmail());
        assertEquals("Consultant One", actualResponse.getConsultant().getFullName());
        // Add assertions for other consultant fields if relevant to the test

        // Verify interactions with mocked dependencies
        verify(googleCalendarService).createGGMeetAppointment(request);
        verify(availabilityService).confirmConsultantScheduledSlots("consultant1", Instant.parse(request.getAppointmentDateTime()), AppointmentStatus.CONFIRMED);
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void testCreateAppointment_GeneralSecurityException() throws GeneralSecurityException, IOException {
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .appointmentDateTime(Instant.now().plus(Duration.ofDays(1)).toString())
                .consultantID("consultant1")
                .build();
        when(googleCalendarService.createGGMeetAppointment(request)).thenThrow(new GeneralSecurityException("Security error"));

        assertThrows(GeneralSecurityException.class, () -> appointmentService.createAppointment(request));
        verify(googleCalendarService).createGGMeetAppointment(request);
        verifyNoInteractions(appointmentRepository, userService, availabilityService);
    }

    @Test
    void testCreateAppointment_IOException() throws GeneralSecurityException, IOException {
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .appointmentDateTime(Instant.now().plus(Duration.ofDays(1)).toString())
                .consultantID("consultant1")
                .build();
        when(googleCalendarService.createGGMeetAppointment(request)).thenThrow(new IOException("Network error"));

        assertThrows(IOException.class, () -> appointmentService.createAppointment(request));
        verify(googleCalendarService).createGGMeetAppointment(request);
        verifyNoInteractions(appointmentRepository, userService, availabilityService);
    }

    @Test
    void testCreateAppointment_MemberNotFound() throws GeneralSecurityException, IOException {
        // Arrange
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .appointmentDateTime(Instant.now().plus(Duration.ofDays(1)).toString())
                .consultantID("consultant1")
                .notes("Initial notes")
                .build();

        Appointment mockAppointment = new Appointment();

        when(appointmentMapper.toEntity(request)).thenReturn(mockAppointment);
        when(googleCalendarService.createGGMeetAppointment(request)).thenReturn("http://meet.google.com/link");
        when(userService.getLoginUsername()).thenReturn("testMember");

        // Simulate EntityNotFoundException when fetching the member user
        when(userService.getUserEntity("testMember")).thenThrow(new EntityNotFoundException("Member not found"));

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> appointmentService.createAppointment(request));

        // Verify interactions
        verify(appointmentMapper).toEntity(request);
        verify(googleCalendarService).createGGMeetAppointment(request);
        verify(userService).getLoginUsername();
        verify(userService).getUserEntity("testMember");

        // Make sure no interactions happened with these
        verifyNoInteractions(appointmentRepository, availabilityService);
    }

    @Test
    void testCreateAppointment_ConsultantNotFound() throws GeneralSecurityException, IOException {
        // Arrange
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .appointmentDateTime(Instant.now().plus(Duration.ofDays(1)).toString())
                .consultantID("consultant1")
                .notes("Initial notes")
                .build();

        User member = new User();
        member.setUsername("testMember");

        Appointment mockAppointment = new Appointment(); // <- Fix cho NullPointerException

        when(appointmentMapper.toEntity(request)).thenReturn(mockAppointment);
        when(googleCalendarService.createGGMeetAppointment(request)).thenReturn("http://meet.google.com/link");
        when(userService.getLoginUsername()).thenReturn("testMember");
        when(userService.getUserEntity("testMember")).thenReturn(member);
        when(userService.getUserEntity("consultant1")).thenThrow(new EntityNotFoundException("Consultant not found"));

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> appointmentService.createAppointment(request));

        // Verify interactions
        verify(appointmentMapper).toEntity(request);
        verify(googleCalendarService).createGGMeetAppointment(request);
        verify(userService).getLoginUsername();
        verify(userService).getUserEntity("testMember");
        verify(userService).getUserEntity("consultant1");

        // Đảm bảo không tương tác tiếp với các thành phần không nên dùng sau khi lỗi
        verifyNoInteractions(appointmentRepository, availabilityService);
    }

    // --- 2. getAllAppointments tests ---
    @Test
    void testGetAllAppointments_Success() {
        List<Appointment> appointments = Arrays.asList(new Appointment(), new Appointment());
        List<AppointmentResponse> expectedResponses = Arrays.asList(new AppointmentResponse(), new AppointmentResponse());

        when(appointmentRepository.findAll()).thenReturn(appointments);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(new AppointmentResponse());

        List<AppointmentResponse> actualResponses = appointmentService.getAllAppointments();

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(appointmentRepository).findAll();
        verify(appointmentMapper, times(2)).toDto(any(Appointment.class));
    }

    @Test
    void testGetAllAppointments_NoAppointmentsFound() {
        when(appointmentRepository.findAll()).thenReturn(Collections.emptyList());

        List<AppointmentResponse> actualResponses = appointmentService.getAllAppointments();

        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(appointmentRepository).findAll();
        verifyNoInteractions(appointmentMapper);
    }

    // --- 3. getMemberAppointments tests ---
    @Test
    void testGetMemberAppointments_Success() {
        String username = "testMember";
        List<Appointment> appointments = Arrays.asList(new Appointment(), new Appointment());
        List<AppointmentResponse> expectedResponses = Arrays.asList(new AppointmentResponse(), new AppointmentResponse());

        when(appointmentRepository.findByMemberUsernameOrderByAppointmentDateTimeAsc(username)).thenReturn(appointments);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(new AppointmentResponse());

        List<AppointmentResponse> actualResponses = appointmentService.getMemberAppointments(username);

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(appointmentRepository).findByMemberUsernameOrderByAppointmentDateTimeAsc(username);
        verify(appointmentMapper, times(2)).toDto(any(Appointment.class));
    }

    @Test
    void testGetMemberAppointments_NoAppointmentsForMember() {
        String username = "testMember";
        when(appointmentRepository.findByMemberUsernameOrderByAppointmentDateTimeAsc(username)).thenReturn(Collections.emptyList());

        List<AppointmentResponse> actualResponses = appointmentService.getMemberAppointments(username);

        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(appointmentRepository).findByMemberUsernameOrderByAppointmentDateTimeAsc(username);
        verifyNoInteractions(appointmentMapper);
    }

    // --- 4. getConsultantAppointments tests ---
    @Test
    void testGetConsultantAppointments_Success() {
        String username = "consultant1";
        List<Appointment> appointments = Arrays.asList(new Appointment(), new Appointment());
        List<AppointmentResponse> expectedResponses = Arrays.asList(new AppointmentResponse(), new AppointmentResponse());

        when(appointmentRepository.findByConsultantUsernameOrderByAppointmentDateTimeAsc(username)).thenReturn(appointments);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(new AppointmentResponse());

        List<AppointmentResponse> actualResponses = appointmentService.getConsultantAppointments(username);

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(appointmentRepository).findByConsultantUsernameOrderByAppointmentDateTimeAsc(username);
        verify(appointmentMapper, times(2)).toDto(any(Appointment.class));
    }

    @Test
    void testGetConsultantAppointments_NoAppointmentsForConsultant() {
        String username = "consultant1";
        when(appointmentRepository.findByConsultantUsernameOrderByAppointmentDateTimeAsc(username)).thenReturn(Collections.emptyList());

        List<AppointmentResponse> actualResponses = appointmentService.getConsultantAppointments(username);

        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(appointmentRepository).findByConsultantUsernameOrderByAppointmentDateTimeAsc(username);
        verifyNoInteractions(appointmentMapper);
    }

    // --- 5. getAppointmentEntity tests ---
    @Test
    void testGetAppointmentEntity_Success() {
        UUID id = UUID.randomUUID();
        Appointment appointment = new Appointment();
        when(appointmentRepository.findById(id)).thenReturn(Optional.of(appointment));

        Appointment actualAppointment = appointmentService.getAppointmentEntity(id);

        assertNotNull(actualAppointment);
        assertEquals(appointment, actualAppointment);
        verify(appointmentRepository).findById(id);
    }

    @Test
    void testGetAppointmentEntity_NotFound() {
        UUID id = UUID.randomUUID();
        when(appointmentRepository.findById(id)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> appointmentService.getAppointmentEntity(id));
        assertEquals("Appointment does not exist with ID :" + id, exception.getMessage());
        verify(appointmentRepository).findById(id);
    }

    // --- 6. getAppointment tests ---
    @Test
    void testGetAppointment_Success() {
        UUID id = UUID.randomUUID();
        Appointment appointment = new Appointment();
        AppointmentResponse expectedResponse = new AppointmentResponse();

        when(appointmentRepository.findById(id)).thenReturn(Optional.of(appointment));
        when(appointmentMapper.toDto(appointment)).thenReturn(expectedResponse);

        AppointmentResponse actualResponse = appointmentService.getAppointment(id);

        assertNotNull(actualResponse);
        assertEquals(expectedResponse, actualResponse);
        verify(appointmentRepository).findById(id);
        verify(appointmentMapper).toDto(appointment);
    }

    @Test
    void testGetAppointment_NotFound() {
        UUID id = UUID.randomUUID();
        when(appointmentRepository.findById(id)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> appointmentService.getAppointment(id));
        assertEquals("Appointment does not exist with ID :" + id, exception.getMessage());
        verify(appointmentRepository).findById(id);
        verifyNoInteractions(appointmentMapper);
    }

    // --- 7. updateAppointment tests ---
    @Test
    void testUpdateAppointment_Success() {
        UUID id = UUID.randomUUID();
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime(Instant.now().plus(Duration.ofHours(5)).toString())
                .notes("Updated notes")
                .status(AppointmentStatus.RESCHEDULED)
                .build();
        Appointment existingAppointment = new Appointment();
        existingAppointment.setAppointmentID(id);
        existingAppointment.setAppointmentDateTime(Instant.now());
        existingAppointment.setNotes("Old notes");
        existingAppointment.setStatus(AppointmentStatus.SCHEDULED);
        AppointmentResponse expectedResponse = AppointmentResponse.builder()
                .appointmentID(id)
                .status(AppointmentStatus.RESCHEDULED)
                .notes("Updated notes")
                .build();

        when(appointmentRepository.findById(id)).thenReturn(Optional.of(existingAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(existingAppointment);
        when(appointmentMapper.toDto(existingAppointment)).thenReturn(expectedResponse);

        AppointmentResponse actualResponse = appointmentService.updateAppointment(id, request);

        assertNotNull(actualResponse);
        assertEquals(expectedResponse.getAppointmentID(), actualResponse.getAppointmentID());
        assertEquals(expectedResponse.getStatus(), actualResponse.getStatus());
        assertEquals(expectedResponse.getNotes(), actualResponse.getNotes());
        verify(appointmentRepository).findById(id);
        verify(appointmentRepository).save(existingAppointment);
        verify(appointmentMapper).toDto(existingAppointment);
        assertEquals(Instant.parse(request.getAppointmentDateTime()), existingAppointment.getAppointmentDateTime());
        assertEquals(request.getNotes(), existingAppointment.getNotes());
        assertEquals(request.getStatus(), existingAppointment.getStatus());
    }

    @Test
    void testUpdateAppointment_NotFound() {
        UUID id = UUID.randomUUID();
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime(Instant.now().plus(Duration.ofHours(5)).toString())
                .notes("Updated notes")
                .status(AppointmentStatus.RESCHEDULED)
                .build();

        when(appointmentRepository.findById(id)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> appointmentService.updateAppointment(id, request));
        assertEquals("Appointment does not exist with ID :" + id, exception.getMessage());
        verify(appointmentRepository).findById(id);
        verifyNoMoreInteractions(appointmentRepository, appointmentMapper);
    }

    @Test
    void testUpdateAppointment_InvalidInput() {
        UUID id = UUID.randomUUID();
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime("invalid-date-time") // Invalid format
                .notes("Updated notes")
                .status(AppointmentStatus.RESCHEDULED)
                .build();
        Appointment existingAppointment = new Appointment();
        when(appointmentRepository.findById(id)).thenReturn(Optional.of(existingAppointment));

        assertThrows(DateTimeParseException.class, () -> appointmentService.updateAppointment(id, request));
        verify(appointmentRepository).findById(id);
        verifyNoMoreInteractions(appointmentRepository, appointmentMapper);
    }

    // --- 8. getMemberTodayAppointments tests ---
    @Test
    void testGetMemberTodayAppointments_Success() {
        String username = "testMember";
        Instant now = Instant.now();
        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = LocalDate.now().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        Appointment app1 = new Appointment();
        app1.setAppointmentDateTime(now.plusSeconds(3600)); // Today
        Appointment app2 = new Appointment();
        app2.setAppointmentDateTime(now.plusSeconds(7200)); // Today
        List<Appointment> todayAppointments = Arrays.asList(app1, app2);

        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class))).thenReturn(todayAppointments);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(new AppointmentResponse());

        List<AppointmentResponse> actualResponses = appointmentService.getMemberTodayAppointments(username);

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class));
        verify(appointmentMapper, times(2)).toDto(any(Appointment.class));
    }

    @Test
    void testGetMemberTodayAppointments_NoAppointmentsForMemberToday() {
        String username = "testMember";
        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class))).thenReturn(Collections.emptyList());

        List<AppointmentResponse> actualResponses = appointmentService.getMemberTodayAppointments(username);

        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class));
        verifyNoInteractions(appointmentMapper);
    }

    // --- 9. getConsultantTodayAppointments tests ---
    @Test
    void testGetConsultantTodayAppointments_Success() {
        String username = "consultant1";
        Instant now = Instant.now();
        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = LocalDate.now().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        Appointment app1 = new Appointment();
        app1.setAppointmentDateTime(now.plusSeconds(3600)); // Today
        Appointment app2 = new Appointment();
        app2.setAppointmentDateTime(now.plusSeconds(7200)); // Today
        List<Appointment> todayAppointments = Arrays.asList(app1, app2);

        when(appointmentRepository.findByConsultantUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class))).thenReturn(todayAppointments);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(new AppointmentResponse());

        List<AppointmentResponse> actualResponses = appointmentService.getConsultantTodayAppointments(username);

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(appointmentRepository).findByConsultantUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class));
        verify(appointmentMapper, times(2)).toDto(any(Appointment.class));
    }

    @Test
    void testGetConsultantTodayAppointments_NoAppointmentsForConsultantToday() {
        String username = "consultant1";
        when(appointmentRepository.findByConsultantUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class))).thenReturn(Collections.emptyList());

        List<AppointmentResponse> actualResponses = appointmentService.getConsultantTodayAppointments(username);

        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(appointmentRepository).findByConsultantUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
                eq(username), any(Instant.class), any(Instant.class));
        verifyNoInteractions(appointmentMapper);
    }

    // --- 10. getAllAppointmentsByDateDuration tests ---
    @Test
    void testGetAllAppointmentsByDateDuration_Success() {
        Instant startedAt = Instant.now().minus(Duration.ofDays(7));
        Instant endedAt = Instant.now();
        List<Appointment> appointments = Arrays.asList(new Appointment(), new Appointment());
        List<AppointmentResponse> expectedResponses = Arrays.asList(new AppointmentResponse(), new AppointmentResponse());

        when(appointmentRepository.findByCreatedAtBetween(startedAt, endedAt)).thenReturn(appointments);
        when(appointmentMapper.toDto(any(Appointment.class))).thenReturn(new AppointmentResponse());

        List<AppointmentResponse> actualResponses = appointmentService.getAllAppointmentsByDateDuration(startedAt, endedAt);

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        verify(appointmentRepository).findByCreatedAtBetween(startedAt, endedAt);
        verify(appointmentMapper, times(2)).toDto(any(Appointment.class));
    }

    @Test
    void testGetAllAppointmentsByDateDuration_NoAppointmentsInDuration() {
        Instant startedAt = Instant.now().minus(Duration.ofDays(7));
        Instant endedAt = Instant.now();
        when(appointmentRepository.findByCreatedAtBetween(startedAt, endedAt)).thenReturn(Collections.emptyList());

        List<AppointmentResponse> actualResponses = appointmentService.getAllAppointmentsByDateDuration(startedAt, endedAt);

        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(appointmentRepository).findByCreatedAtBetween(startedAt, endedAt);
        verifyNoInteractions(appointmentMapper);
    }

    // --- 11. countConsultantAppointments tests ---
    @Test
    void testCountConsultantAppointments_Success() {
        String username = "consultant1";
        when(appointmentRepository.countByConsultantUsername(username)).thenReturn(5L);

        long count = appointmentService.countConsultantAppointments(username);

        assertEquals(5L, count);
        verify(appointmentRepository).countByConsultantUsername(username);
    }

    @Test
    void testCountConsultantAppointments_NoAppointments() {
        String username = "consultant1";
        when(appointmentRepository.countByConsultantUsername(username)).thenReturn(0L);

        long count = appointmentService.countConsultantAppointments(username);

        assertEquals(0L, count);
        verify(appointmentRepository).countByConsultantUsername(username);
    }

    // --- 12. countTotalMembersOfConsultant tests ---
    @Test
    void testCountTotalMembersOfConsultant_Success() {
        String username = "consultant1";
        when(appointmentRepository.countDistinctMembersByConsultantUsername(username)).thenReturn(3L);

        long count = appointmentService.countTotalMembersOfConsultant(username);

        assertEquals(3L, count);
        verify(appointmentRepository).countDistinctMembersByConsultantUsername(username);
    }

    @Test
    void testCountTotalMembersOfConsultant_NoMembers() {
        String username = "consultant1";
        when(appointmentRepository.countDistinctMembersByConsultantUsername(username)).thenReturn(0L);

        long count = appointmentService.countTotalMembersOfConsultant(username);

        assertEquals(0L, count);
        verify(appointmentRepository).countDistinctMembersByConsultantUsername(username);
    }

    // --- 13. getMemberBookedAppointmentByStatus tests ---
    @Test
    void testGetMemberBookedAppointmentByStatus_Success_Scheduled() {
        String username = "testMember";
        String fromDateString = "2024-01-01";
        String toDateString = "2024-01-31";
        AppointmentStatus status = AppointmentStatus.SCHEDULED;

        Instant appDateTime1 = LocalDate.parse("2024-01-15").atTime(10, 0).atZone(VIETNAM_ZONE).toInstant();
        Instant appDateTime2 = LocalDate.parse("2024-01-20").atTime(14, 0).atZone(VIETNAM_ZONE).toInstant();

        Appointment app1 = new Appointment();
        app1.setAppointmentDateTime(appDateTime1);
        app1.setStatus(AppointmentStatus.SCHEDULED);
        Appointment app2 = new Appointment();
        app2.setAppointmentDateTime(appDateTime2);
        app2.setStatus(AppointmentStatus.SCHEDULED);

        List<Appointment> scheduledAppointments = Arrays.asList(app1, app2);

        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTimeBetween(
                eq(username), any(Instant.class), any(Instant.class))).thenReturn(scheduledAppointments);

        List<LocalDateTime> actualResponses = appointmentService.getMemberBookedAppointmentByStatus(username, fromDateString, toDateString, status);

        assertNotNull(actualResponses);
        assertEquals(2, actualResponses.size());
        assertEquals(LocalDateTime.of(2024, 1, 15, 10, 0), actualResponses.get(0));
        assertEquals(LocalDateTime.of(2024, 1, 20, 14, 0), actualResponses.get(1));
        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTimeBetween(eq(username), any(Instant.class), any(Instant.class));
    }

    @Test
    void testGetMemberBookedAppointmentByStatus_Success_Cancelled() {
        String username = "testMember";
        String fromDateString = "2024-01-01";
        String toDateString = "2024-01-31";
        AppointmentStatus status = AppointmentStatus.CANCELLED;

        Instant appDateTime1 = LocalDate.parse("2024-01-15").atTime(10, 0).atZone(VIETNAM_ZONE).toInstant();
        Instant appDateTime2 = LocalDate.parse("2024-01-20").atTime(14, 0).atZone(VIETNAM_ZONE).toInstant();

        Appointment app1 = new Appointment();
        app1.setAppointmentDateTime(appDateTime1);
        app1.setStatus(AppointmentStatus.CANCELLED);
        Appointment app2 = new Appointment();
        app2.setAppointmentDateTime(appDateTime2);
        app2.setStatus(AppointmentStatus.SCHEDULED); // This one should be filtered out

        List<Appointment> allAppointments = Arrays.asList(app1, app2);

        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTimeBetween(
                eq(username), any(Instant.class), any(Instant.class))).thenReturn(allAppointments);

        List<LocalDateTime> actualResponses = appointmentService.getMemberBookedAppointmentByStatus(username, fromDateString, toDateString, status);

        assertNotNull(actualResponses);
        assertEquals(1, actualResponses.size());
        assertEquals(LocalDateTime.of(2024, 1, 15, 10, 0), actualResponses.get(0));
        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTimeBetween(eq(username), any(Instant.class), any(Instant.class));
    }

    @Test
    void testGetMemberBookedAppointmentByStatus_NoMatchingAppointments() {
        String username = "testMember";
        String fromDateString = "2024-01-01";
        String toDateString = "2024-01-31";
        AppointmentStatus status = AppointmentStatus.COMPLETED;

        Instant appDateTime1 = LocalDate.parse("2024-01-15").atTime(10, 0).atZone(VIETNAM_ZONE).toInstant();
        Appointment app1 = new Appointment();
        app1.setAppointmentDateTime(appDateTime1);
        app1.setStatus(AppointmentStatus.SCHEDULED); // Mismatch status

        List<Appointment> appointments = Arrays.asList(app1);

        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTimeBetween(
                eq(username), any(Instant.class), any(Instant.class))).thenReturn(appointments);

        List<LocalDateTime> actualResponses = appointmentService.getMemberBookedAppointmentByStatus(username, fromDateString, toDateString, status);

        assertNotNull(actualResponses);
        assertTrue(actualResponses.isEmpty());
        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTimeBetween(eq(username), any(Instant.class), any(Instant.class));
    }

    // --- 14. cancelMemberScheduledAppointment tests ---
    @Test
    void testCancelMemberScheduledAppointment_Success() throws MessagingException {
        String loginUsername = "testMember";
        Instant slotToCancel = Instant.now().plus(Duration.ofDays(1));
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime(slotToCancel.toString())
                .status(AppointmentStatus.CANCELLED)
                .notes("Member no longer available")
                .build();

        User member = new User();
        member.setUsername(loginUsername);
        member.setEmail("member@example.com");
        User consultant = new User();
        consultant.setUsername("consultant1");
        consultant.setEmail("consultant@example.com");

        Appointment appointment = new Appointment();
        appointment.setAppointmentDateTime(slotToCancel);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setMember(member);
        appointment.setConsultant(consultant);
        appointment.setNotes("Old notes");

        Availability availability = new Availability();
        availability.setAvailabilityDateTime(slotToCancel);
        availability.setStatus(AppointmentStatus.CONFIRMED);

        when(userService.getLoginUsername()).thenReturn(loginUsername);
        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel))
                .thenReturn(appointment);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(availabilityService.getConsultantAvailabilityEntityByAvailabilityDateTime(consultant.getUsername(), slotToCancel))
                .thenReturn(availability);
        when(availabilityRepository.save(any(Availability.class))).thenReturn(availability);
        doNothing().when(emailService).sendEmail(any(MailBody.class));
        when(appointmentMapper.toDto(appointment)).thenReturn(AppointmentResponse.builder()
                .appointmentID(UUID.randomUUID())
                .status(AppointmentStatus.CANCELLED)
                .build());

        AppointmentResponse actualResponse = appointmentService.cancelMemberScheduledAppointment(AppointmentStatus.CANCELLED, request);

        assertNotNull(actualResponse);
        assertEquals(AppointmentStatus.CANCELLED, actualResponse.getStatus());
        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
        assertEquals("Member no longer available", appointment.getNotes());
        assertEquals(AppointmentStatus.CANCELLED, availability.getStatus());

        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel);
        verify(appointmentRepository).save(appointment);
        verify(availabilityService).getConsultantAvailabilityEntityByAvailabilityDateTime(consultant.getUsername(), slotToCancel);
        verify(availabilityRepository).save(availability);
        verify(emailService).sendEmail(any(MailBody.class));
    }

    @Test
    void testCancelMemberScheduledAppointment_AppointmentNotFound() {
        String loginUsername = "testMember";
        Instant slotToCancel = Instant.now().plus(Duration.ofDays(1));
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime(slotToCancel.toString())
                .status(AppointmentStatus.CANCELLED)
                .notes("Reason")
                .build();

        when(userService.getLoginUsername()).thenReturn(loginUsername);
        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel))
                .thenReturn(null);

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> appointmentService.cancelMemberScheduledAppointment(AppointmentStatus.CANCELLED, request));
        assertEquals("This appointment does not exist to cancel", exception.getMessage());
        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel);
        verifyNoMoreInteractions(appointmentRepository, availabilityService, availabilityRepository, emailService);
    }

    @Test
    void testCancelMemberScheduledAppointment_InvalidStatus() {
        String loginUsername = "testMember";
        Instant slotToCancel = Instant.now().plus(Duration.ofDays(1));
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime(slotToCancel.toString())
                .status(AppointmentStatus.SCHEDULED) // Invalid status
                .notes("Reason")
                .build();

        Appointment appointment = new Appointment();
        appointment.setAppointmentDateTime(slotToCancel);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setMember(new User());

        when(userService.getLoginUsername()).thenReturn(loginUsername);
        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel))
                .thenReturn(appointment);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> appointmentService.cancelMemberScheduledAppointment(AppointmentStatus.SCHEDULED, request));
        assertEquals("This status does not exist in AppointmentStatus", exception.getMessage());
        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel);
        verifyNoMoreInteractions(appointmentRepository, availabilityService, availabilityRepository, emailService);
    }

    @Test
    void testCancelMemberScheduledAppointment_MessagingException() throws MessagingException {
        String loginUsername = "testMember";
        Instant slotToCancel = Instant.now().plus(Duration.ofDays(1));
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime(slotToCancel.toString())
                .status(AppointmentStatus.CANCELLED)
                .notes("Reason for cancellation")
                .build();

        User member = new User();
        member.setUsername(loginUsername);
        member.setEmail("member@example.com");
        User consultant = new User();
        consultant.setUsername("consultant1");
        consultant.setEmail("consultant@example.com");

        Appointment appointment = new Appointment();
        appointment.setAppointmentDateTime(slotToCancel);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setMember(member);
        appointment.setConsultant(consultant);

        Availability availability = new Availability();
        availability.setAvailabilityDateTime(slotToCancel);
        availability.setStatus(AppointmentStatus.CONFIRMED);

        when(userService.getLoginUsername()).thenReturn(loginUsername);
        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel))
                .thenReturn(appointment);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(availabilityService.getConsultantAvailabilityEntityByAvailabilityDateTime(consultant.getUsername(), slotToCancel))
                .thenReturn(availability);
        when(availabilityRepository.save(any(Availability.class))).thenReturn(availability);
        doThrow(new MessagingException("Failed to send email")).when(emailService).sendEmail(any(MailBody.class));

        MessagingException exception = assertThrows(MessagingException.class,
                () -> appointmentService.cancelMemberScheduledAppointment(AppointmentStatus.CANCELLED, request));
        assertEquals("Failed to send email", exception.getMessage());

        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel);
        verify(appointmentRepository).save(appointment);
        verify(availabilityService).getConsultantAvailabilityEntityByAvailabilityDateTime(consultant.getUsername(), slotToCancel);
        verify(availabilityRepository).save(availability);
        verify(emailService).sendEmail(any(MailBody.class));
        // Verify that appointment and availability status are still updated despite email failure
        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
        assertEquals(AppointmentStatus.CANCELLED, availability.getStatus());
    }

    @Test
    void testCancelMemberScheduledAppointment_AvailabilityNotFound() throws MessagingException {
        String loginUsername = "testMember";
        Instant slotToCancel = Instant.now().plus(Duration.ofDays(1));
        UpdateAppointmentRequest request = UpdateAppointmentRequest.builder()
                .appointmentDateTime(slotToCancel.toString())
                .status(AppointmentStatus.CANCELLED)
                .notes("Reason for cancellation")
                .build();

        User member = new User();
        member.setUsername(loginUsername);
        member.setEmail("member@example.com");

        User consultant = new User();
        consultant.setUsername("consultant1");
        consultant.setEmail("consultant@example.com");

        Appointment appointment = new Appointment();
        appointment.setAppointmentDateTime(slotToCancel);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setMember(member);
        appointment.setConsultant(consultant);

        AppointmentResponse response = AppointmentResponse.builder()
                .appointmentID(UUID.randomUUID())
                .status(AppointmentStatus.CANCELLED)
                .build();

        // Mock dependencies
        when(userService.getLoginUsername()).thenReturn(loginUsername);
        when(appointmentRepository.findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel))
                .thenReturn(appointment);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);
        when(availabilityService.getConsultantAvailabilityEntityByAvailabilityDateTime(consultant.getUsername(), slotToCancel))
                .thenReturn(null); // Simulate no availability found
        when(appointmentMapper.toDto(appointment)).thenReturn(response); // Fix: avoid returning null

        // Act
        AppointmentResponse actualResponse = appointmentService.cancelMemberScheduledAppointment(AppointmentStatus.CANCELLED, request);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(AppointmentStatus.CANCELLED, actualResponse.getStatus());
        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());

        verify(appointmentRepository).findByMemberUsernameAndAppointmentDateTime(loginUsername, slotToCancel);
        verify(appointmentRepository).save(appointment);
        verify(availabilityService).getConsultantAvailabilityEntityByAvailabilityDateTime(consultant.getUsername(), slotToCancel);
        verify(appointmentMapper).toDto(appointment);
        verifyNoInteractions(availabilityRepository); // No save if availability == null
        verifyNoInteractions(emailService);          // No email sent
    }
}