package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.MailBody;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AvailabilityResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import com.swp.drug_use_prevention_support_system.domain.entities.Availability;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.AvailabilityMapper;
import com.swp.drug_use_prevention_support_system.repositories.AppointmentRepository;
import com.swp.drug_use_prevention_support_system.repositories.AvailabilityRepository;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock
    private AvailabilityRepository availabilityRepository;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private AvailabilityMapper availabilityMapper;
    @Mock
    private UserService userService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AvailabilityService availabilityService;

    private User consultant;
    private User member;
    private Instant now;
    private ZoneId vietnamZone;

    @BeforeEach
    void setUp() {
        consultant = User.builder()
                .username("consultant123")
                .email("consultant@example.com")
                .consultantAvailabilities(new ArrayList<>())
                .build();

        member = User.builder()
                .username("member123")
                .email("member@example.com")
                .build();

        now = Instant.now();
        vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
    }

    @Test
    void createConsultantAvailabilities_success() {
        CreateAvailabilityRequest request = CreateAvailabilityRequest.builder()
                .availabilityDateTimes(Arrays.asList(
                        now.plusSeconds(3600).toString(), // 1 hour from now
                        now.plusSeconds(7200).toString()  // 2 hours from now
                ))
                .build();

        when(userService.getLoginUsername()).thenReturn("consultant123");
        when(userService.getUserEntity("consultant123")).thenReturn(consultant);
        when(availabilityRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<Availability> availabilities = invocation.getArgument(0);
            availabilities.forEach(avail -> avail.setAvailabilityID(UUID.randomUUID()));
            return availabilities;
        });
        when(availabilityMapper.toDto(any(Availability.class))).thenAnswer(invocation -> {
            Availability avail = invocation.getArgument(0);
            return AvailabilityResponse.builder()
                    .availabilityID(avail.getAvailabilityID())
                    .status(avail.getStatus())
                    .build();
        });

        List<AvailabilityResponse> responses = availabilityService.createConsultantAvailabilities(request);

        assertNotNull(responses);
        assertEquals(2, responses.size());
        verify(availabilityRepository, times(1)).saveAll(anyList());
        verify(userService, times(1)).getLoginUsername();
        verify(userService, times(1)).getUserEntity("consultant123");
    }

    @Test
    void createConsultantAvailabilities_skipsExisting() {
        Instant existingTime = now.plusSeconds(3600); // 1 hour from now
        Availability existingAvailability = Availability.builder()
                .availabilityDateTime(existingTime)
                .status(AppointmentStatus.SCHEDULED)
                .consultant(consultant)
                .build();
        consultant.getConsultantAvailabilities().add(existingAvailability);

        CreateAvailabilityRequest request = CreateAvailabilityRequest.builder()
                .availabilityDateTimes(Arrays.asList(
                        existingTime.toString(),
                        now.plusSeconds(7200).toString()
                ))
                .build();

        when(userService.getLoginUsername()).thenReturn("consultant123");
        when(userService.getUserEntity("consultant123")).thenReturn(consultant);
        when(availabilityRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<Availability> availabilities = invocation.getArgument(0);
            availabilities.forEach(avail -> avail.setAvailabilityID(UUID.randomUUID()));
            return availabilities;
        });
        when(availabilityMapper.toDto(any(Availability.class))).thenAnswer(invocation -> {
            Availability avail = invocation.getArgument(0);
            return AvailabilityResponse.builder()
                    .availabilityID(avail.getAvailabilityID())
                    .status(avail.getStatus())
                    .build();
        });


        List<AvailabilityResponse> responses = availabilityService.createConsultantAvailabilities(request);

        assertNotNull(responses);
        assertEquals(1, responses.size()); // Only one new availability should be saved
        // Corrected line: Cast 'list' to List before calling size()
        verify(availabilityRepository, times(1)).saveAll(argThat(list -> ((List<?>) list).size() == 1));
    }

    @Test
    void getConsultantBookedSlotsByStatus_returnsCorrectSlots() {
        String username = "consultant123";
        String fromDate = "2025-07-15";
        String toDate = "2025-07-17";
        AppointmentStatus status = AppointmentStatus.CONFIRMED;

        Instant time1 = LocalDateTime.of(2025, 7, 15, 9, 0).atZone(vietnamZone).toInstant();
        Instant time2 = LocalDateTime.of(2025, 7, 16, 10, 0).atZone(vietnamZone).toInstant();
        Instant time3 = LocalDateTime.of(2025, 7, 17, 11, 0).atZone(vietnamZone).toInstant();
        Instant time4 = LocalDateTime.of(2025, 7, 15, 14, 0).atZone(vietnamZone).toInstant(); // Different status

        List<Availability> mockAvailabilities = Arrays.asList(
                Availability.builder().availabilityDateTime(time1).status(AppointmentStatus.CONFIRMED).build(),
                Availability.builder().availabilityDateTime(time2).status(AppointmentStatus.CONFIRMED).build(),
                Availability.builder().availabilityDateTime(time3).status(AppointmentStatus.CANCELLED).build(), // Should be filtered out
                Availability.builder().availabilityDateTime(time4).status(AppointmentStatus.SCHEDULED).build()  // Should be filtered out
        );

        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTimeBetween(
                eq(username), any(Instant.class), any(Instant.class)))
                .thenReturn(mockAvailabilities);

        List<LocalDateTime> result = availabilityService.getConsultantBookedSlotsByStatus(username, fromDate, toDate, status);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.contains(LocalDateTime.of(2025, 7, 15, 9, 0)));
        assertTrue(result.contains(LocalDateTime.of(2025, 7, 16, 10, 0)));
        verify(availabilityRepository, times(1)).findByConsultantUsernameAndAvailabilityDateTimeBetween(
                eq(username), any(Instant.class), any(Instant.class));
    }

    @Test
    void getConsultantBookedSlotsByStatus_noSlotsFound() {
        String username = "consultant123";
        String fromDate = "2025-07-15";
        String toDate = "2025-07-17";
        AppointmentStatus status = AppointmentStatus.CONFIRMED;

        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTimeBetween(
                eq(username), any(Instant.class), any(Instant.class)))
                .thenReturn(Collections.emptyList());

        List<LocalDateTime> result = availabilityService.getConsultantBookedSlotsByStatus(username, fromDate, toDate, status);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(availabilityRepository, times(1)).findByConsultantUsernameAndAvailabilityDateTimeBetween(
                eq(username), any(Instant.class), any(Instant.class));
    }

//    @Test
//    void getConsultantAvailableSlots_returnsCorrectSlots() {
//        String username = "consultant123";
//        String fromDate = "2025-07-15";
//        String toDate = "2025-07-15"; // Test for a single day
//
//        // Mock existing unavailable slots (e.g., scheduled or confirmed)
//        Instant unavailableTime1 = LocalDateTime.of(2025, 7, 15, 9, 0).atZone(vietnamZone).toInstant(); // Scheduled
//        Instant unavailableTime2 = LocalDateTime.of(2025, 7, 15, 10, 0).atZone(vietnamZone).toInstant(); // Confirmed
//        Instant cancelledTime = LocalDateTime.of(2025, 7, 15, 11, 0).atZone(vietnamZone).toInstant(); // Cancelled - should be available
//
//        List<Availability> mockUnavailableAvailabilities = Arrays.asList(
//                Availability.builder().availabilityDateTime(unavailableTime1).status(AppointmentStatus.SCHEDULED).build(),
//                Availability.builder().availabilityDateTime(unavailableTime2).status(AppointmentStatus.CONFIRMED).build(),
//                Availability.builder().availabilityDateTime(cancelledTime).status(AppointmentStatus.CANCELLED).build()
//        );
//
//        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTimeBetween(
//                eq(username), any(Instant.class), any(Instant.class)))
//                .thenReturn(mockUnavailableAvailabilities);
//
//        // Capture current time to ensure future slots are returned
//        // Adjust the system clock for reliable testing of `Instant.now()`
//        try (var mockedStaticInstant = mockStatic(Instant.class)) {
//            Instant fixedNow = LocalDateTime.of(2025, 7, 15, 8, 30).atZone(vietnamZone).toInstant();
//            mockedStaticInstant.when(Instant::now).thenReturn(fixedNow);
//
//            List<LocalDateTime> result = availabilityService.getConsultantAvailableSlots(username, fromDate, toDate);
//
//            assertNotNull(result);
//            // Expected available slots for 2025-07-15 (8-17, excluding 12, and excluding unavailableTime1, unavailableTime2)
//            // Available: 8, 11 (cancelled slot), 13, 14, 15, 16, 17
//            assertEquals(7, result.size());
//            assertTrue(result.contains(LocalDateTime.of(2025, 7, 15, 8, 0)));
//            assertFalse(result.contains(LocalDateTime.of(2025, 7, 15, 9, 0))); // Unavailable
//            assertFalse(result.contains(LocalDateTime.of(2025, 7, 15, 10, 0)));// Unavailable
//            assertTrue(result.contains(LocalDateTime.of(2025, 7, 15, 11, 0))); // Cancelled, so available
//            assertFalse(result.contains(LocalDateTime.of(2025, 7, 15, 12, 0)));// Lunch break
//            assertTrue(result.contains(LocalDateTime.of(2025, 7, 15, 13, 0)));
//            assertTrue(result.contains(LocalDateTime.of(2025, 7, 15, 17, 0)));
//            verify(availabilityRepository, times(1)).findByConsultantUsernameAndAvailabilityDateTimeBetween(
//                    eq(username), any(Instant.class), any(Instant.class));
//        }
//    }

//    @Test
//    void getConsultantAvailableSlots_noUnavailableSlots() {
//        String username = "consultant123";
//        String fromDate = "2025-07-15";
//        String toDate = "2025-07-15";
//
//        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTimeBetween(
//                eq(username), any(Instant.class), any(Instant.class)))
//                .thenReturn(Collections.emptyList());
//
//        try (var mockedStaticInstant = mockStatic(Instant.class)) {
//            Instant fixedNow = LocalDateTime.of(2025, 7, 15, 7, 0).atZone(vietnamZone).toInstant();
//            mockedStaticInstant.when(Instant::now).thenReturn(fixedNow);
//
//            List<LocalDateTime> result = availabilityService.getConsultantAvailableSlots(username, fromDate, toDate);
//
//            assertNotNull(result);
//            // Expected total slots for one day (8-17, exclude 12) = 9 slots
//            assertEquals(9, result.size());
//            verify(availabilityRepository, times(1)).findByConsultantUsernameAndAvailabilityDateTimeBetween(
//                    eq(username), any(Instant.class), any(Instant.class));
//        }
//    }

    @Test
    void cancelConsultantScheduledSlots_success_withAppointment() throws MessagingException {
        Instant slotToCancel = now.plusSeconds(3600);
        UpdateAvailabilityRequest request = UpdateAvailabilityRequest.builder()
                .availabilityDateTime(slotToCancel.toString())
                .reason("Consultant is sick")
                .build();

        Availability availability = Availability.builder()
                .availabilityID(UUID.randomUUID())
                .availabilityDateTime(slotToCancel)
                .status(AppointmentStatus.SCHEDULED)
                .consultant(consultant)
                .build();

        Appointment appointment = Appointment.builder()
                .appointmentID(UUID.randomUUID())
                .appointmentDateTime(slotToCancel)
                .consultant(consultant)
                .member(member)
                .status(AppointmentStatus.SCHEDULED)
                .build();

        when(userService.getLoginUsername()).thenReturn("consultant123");
        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTime(
                "consultant123", slotToCancel)).thenReturn(availability);
        when(appointmentRepository.findByConsultantUsernameAndAppointmentDateTime(
                "consultant123", slotToCancel)).thenReturn(appointment);
        when(availabilityMapper.toDto(any(Availability.class))).thenReturn(AvailabilityResponse.builder()
                .availabilityID(availability.getAvailabilityID())
                .status(AppointmentStatus.CANCELLED)
                .build());

        AvailabilityResponse response = availabilityService.cancelConsultantScheduledSlots(AppointmentStatus.CANCELLED, request);

        assertNotNull(response);
        assertEquals(AppointmentStatus.CANCELLED, response.getStatus());
        verify(availabilityRepository, times(1)).save(availability);
        verify(appointmentRepository, times(1)).save(appointment);
        verify(emailService, times(1)).sendEmail(any(MailBody.class));
        assertEquals(AppointmentStatus.CANCELLED, availability.getStatus());
        assertEquals("Consultant is sick", availability.getReason());
        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
    }

    @Test
    void cancelConsultantScheduledSlots_success_noAppointment() throws MessagingException {
        Instant slotToCancel = now.plusSeconds(3600);
        UpdateAvailabilityRequest request = UpdateAvailabilityRequest.builder()
                .availabilityDateTime(slotToCancel.toString())
                .reason("Consultant is on vacation")
                .build();

        Availability availability = Availability.builder()
                .availabilityID(UUID.randomUUID())
                .availabilityDateTime(slotToCancel)
                .status(AppointmentStatus.SCHEDULED)
                .consultant(consultant)
                .build();

        when(userService.getLoginUsername()).thenReturn("consultant123");
        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTime(
                "consultant123", slotToCancel)).thenReturn(availability);
        when(appointmentRepository.findByConsultantUsernameAndAppointmentDateTime(
                "consultant123", slotToCancel)).thenReturn(null); // No associated appointment
        when(availabilityMapper.toDto(any(Availability.class))).thenReturn(AvailabilityResponse.builder()
                .availabilityID(availability.getAvailabilityID())
                .status(AppointmentStatus.CANCELLED)
                .build());


        AvailabilityResponse response = availabilityService.cancelConsultantScheduledSlots(AppointmentStatus.CANCELLED, request);

        assertNotNull(response);
        assertEquals(AppointmentStatus.CANCELLED, response.getStatus());
        verify(availabilityRepository, times(1)).save(availability);
        verify(appointmentRepository, never()).save(any(Appointment.class)); // No appointment to save
        verify(emailService, never()).sendEmail(any(MailBody.class)); // No email if no appointment
        assertEquals(AppointmentStatus.CANCELLED, availability.getStatus());
        assertEquals("Consultant is on vacation", availability.getReason());
    }

    @Test
    void cancelConsultantScheduledSlots_invalidStatus_throwsRuntimeException() throws MessagingException {
        Instant slotToCancel = now.plusSeconds(3600);
        UpdateAvailabilityRequest request = UpdateAvailabilityRequest.builder()
                .availabilityDateTime(slotToCancel.toString())
                .reason("Test reason")
                .build();

        Availability availability = Availability.builder()
                .availabilityID(UUID.randomUUID())
                .availabilityDateTime(slotToCancel)
                .status(AppointmentStatus.SCHEDULED)
                .consultant(consultant)
                .build();

        when(userService.getLoginUsername()).thenReturn("consultant123");
        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTime(
                "consultant123", slotToCancel)).thenReturn(availability);

        RuntimeException thrown = assertThrows(RuntimeException.class, () ->
                availabilityService.cancelConsultantScheduledSlots(AppointmentStatus.CONFIRMED, request));

        assertEquals("This status does not exist in AppointmentStatus", thrown.getMessage());
        verify(availabilityRepository, never()).save(any(Availability.class));
        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(emailService, never()).sendEmail(any(MailBody.class));
    }

    @Test
    void cancelConsultantScheduledSlots_slotNotFound_throwsEntityNotFoundException() throws MessagingException {
        Instant slotToCancel = now.plusSeconds(3600);
        UpdateAvailabilityRequest request = UpdateAvailabilityRequest.builder()
                .availabilityDateTime(slotToCancel.toString())
                .reason("Test reason")
                .build();

        when(userService.getLoginUsername()).thenReturn("consultant123");
        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTime(
                "consultant123", slotToCancel)).thenReturn(null);

        EntityNotFoundException thrown = assertThrows(EntityNotFoundException.class, () ->
                availabilityService.cancelConsultantScheduledSlots(AppointmentStatus.CANCELLED, request));

        assertEquals("This slot does not exist to cancel", thrown.getMessage());
        verify(availabilityRepository, never()).save(any(Availability.class));
        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(emailService, never()).sendEmail(any(MailBody.class));
    }

    @Test
    void confirmConsultantScheduledSlots_success() {
        String username = "consultant123";
        Instant timeToConfirm = now.plusSeconds(3600);
        AppointmentStatus newStatus = AppointmentStatus.CONFIRMED;

        Availability availability = Availability.builder()
                .availabilityID(UUID.randomUUID())
                .availabilityDateTime(timeToConfirm)
                .status(AppointmentStatus.SCHEDULED)
                .consultant(consultant)
                .build();

        when(availabilityRepository.findByConsultantUsernameAndAvailabilityDateTime(
                username, timeToConfirm)).thenReturn(availability);

        availabilityService.confirmConsultantScheduledSlots(username, timeToConfirm, newStatus);

        assertEquals(newStatus, availability.getStatus());
        verify(availabilityRepository, times(1)).save(availability);
    }
}