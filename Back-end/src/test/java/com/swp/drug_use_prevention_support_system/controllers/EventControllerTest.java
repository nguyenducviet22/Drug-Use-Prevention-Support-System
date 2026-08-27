package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.SaveAsDraftRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventStatusResponse; // Assuming this DTO exists
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.EventUserStatus;
import com.swp.drug_use_prevention_support_system.services.EventService;
import com.swp.drug_use_prevention_support_system.services.ExcelService;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EventControllerTest {

    @Mock
    private EventService eventService;

    @Mock
    private ExcelService excelService;

    @InjectMocks
    private EventController eventController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Mock SecurityContextHolder for tests that require authentication
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(SecurityContextHolder.getContext().getAuthentication().getName()).thenReturn("testUser");
    }

    // --- 1. createEvent tests ---
    @Test
    void testCreateEvent_Success() {
        CreateEventRequest request = CreateEventRequest.builder()
                .eventName("New Event")
                .duration(60)
                .quantity(100)
                .description("Description")
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Venue A")
                .fee(10.0)
                .details("Details")
                .build();
        EventResponse mockResponse = EventResponse.builder()
                .eventID(UUID.randomUUID())
                .eventName("New Event")
                .build();
        when(eventService.createEvent(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<EventResponse>> response = eventController.createEvent(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("New Event", response.getBody().getData().getEventName());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(eventService).createEvent(request);
    }

    @Test
    void testCreateEvent_InvalidInput_EventNameBlank() {
        CreateEventRequest invalidRequest = CreateEventRequest.builder()
                .eventName("") // Blank name
                .duration(60)
                .quantity(100)
                .description("Description")
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Venue A")
                .fee(10.0)
                .details("Details")
                .build();
        when(eventService.createEvent(invalidRequest))
                .thenThrow(new ConstraintViolationException("Event name must not be blank", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.createEvent(invalidRequest));
        verify(eventService).createEvent(invalidRequest);
    }

    @Test
    void testCreateEvent_InvalidInput_DurationNegative() {
        CreateEventRequest invalidRequest = CreateEventRequest.builder()
                .eventName("New Event")
                .duration(-10) // Negative duration
                .quantity(100)
                .description("Description")
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Venue A")
                .fee(10.0)
                .details("Details")
                .build();
        when(eventService.createEvent(invalidRequest))
                .thenThrow(new ConstraintViolationException("Duration must be a positive number", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.createEvent(invalidRequest));
        verify(eventService).createEvent(invalidRequest);
    }

    @Test
    void testCreateEvent_InvalidInput_StartDateInPast() {
        CreateEventRequest invalidRequest = CreateEventRequest.builder()
                .eventName("New Event")
                .duration(60)
                .quantity(100)
                .description("Description")
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().minusDays(1)) // Past date
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Venue A")
                .fee(10.0)
                .details("Details")
                .build();
        when(eventService.createEvent(invalidRequest))
                .thenThrow(new ConstraintViolationException("Start date must be today or in the future", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.createEvent(invalidRequest));
        verify(eventService).createEvent(invalidRequest);
    }

    @Test
    void testCreateEvent_InvalidInput_FeeNegative() {
        CreateEventRequest invalidRequest = CreateEventRequest.builder()
                .eventName("New Event")
                .duration(60)
                .quantity(100)
                .description("Description")
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Venue A")
                .fee(-5.0) // Negative fee
                .details("Details")
                .build();
        when(eventService.createEvent(invalidRequest))
                .thenThrow(new ConstraintViolationException("Fee cannot be negative", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.createEvent(invalidRequest));
        verify(eventService).createEvent(invalidRequest);
    }

    // --- 2. saveEventAsDraft tests ---
    @Test
    void testSaveEventAsDraft_Success() {
        SaveAsDraftRequest request = SaveAsDraftRequest.builder()
                .eventName("Draft Event")
                .duration(30)
                .quantity(50)
                .description("Draft Description")
                .ageGroup(AgeGroup.SENIOR)
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(6))
                .location("Online")
                .fee(0.0)
                .details("Draft Details")
                .build();
        EventResponse mockResponse = EventResponse.builder()
                .eventID(UUID.randomUUID())
                .eventName("Draft Event")
                .build();
        when(eventService.saveEventAsDraft(request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<EventResponse>> response = eventController.saveEventAsDraft(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Draft Event", response.getBody().getData().getEventName());
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        verify(eventService).saveEventAsDraft(request);
    }

    @Test
    void testSaveEventAsDraft_InvalidInput_EventNameBlank() {
        SaveAsDraftRequest invalidRequest = SaveAsDraftRequest.builder()
                .eventName("") // Blank name
                .duration(30)
                .quantity(50)
                .description("Draft Description")
                .ageGroup(AgeGroup.SENIOR)
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(6))
                .location("Online")
                .fee(0.0)
                .details("Draft Details")
                .build();
        when(eventService.saveEventAsDraft(invalidRequest))
                .thenThrow(new ConstraintViolationException("Event name must not be blank", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.saveEventAsDraft(invalidRequest));
        verify(eventService).saveEventAsDraft(invalidRequest);
    }

    @Test
    void testSaveEventAsDraft_InvalidInput_QuantityNegative() {
        SaveAsDraftRequest invalidRequest = SaveAsDraftRequest.builder()
                .eventName("Draft Event")
                .duration(30)
                .quantity(-10) // Negative quantity
                .description("Draft Description")
                .ageGroup(AgeGroup.SENIOR)
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(6))
                .location("Online")
                .fee(0.0)
                .details("Draft Details")
                .build();
        when(eventService.saveEventAsDraft(invalidRequest))
                .thenThrow(new ConstraintViolationException("Quantity cannot be negative", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.saveEventAsDraft(invalidRequest));
        verify(eventService).saveEventAsDraft(invalidRequest);
    }

    @Test
    void testSaveEventAsDraft_InvalidInput_EndDateInPast() {
        SaveAsDraftRequest invalidRequest = SaveAsDraftRequest.builder()
                .eventName("Draft Event")
                .duration(30)
                .quantity(50)
                .description("Draft Description")
                .ageGroup(AgeGroup.SENIOR)
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().minusDays(2)) // End date in past
                .location("Online")
                .fee(0.0)
                .details("Draft Details")
                .build();
        when(eventService.saveEventAsDraft(invalidRequest))
                .thenThrow(new ConstraintViolationException("End date must be today or in the future", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.saveEventAsDraft(invalidRequest));
        verify(eventService).saveEventAsDraft(invalidRequest);
    }

    @Test
    void testSaveEventAsDraft_InvalidInput_LocationNull() {
        SaveAsDraftRequest invalidRequest = SaveAsDraftRequest.builder()
                .eventName("Draft Event")
                .duration(30)
                .quantity(50)
                .description("Draft Description")
                .ageGroup(AgeGroup.SENIOR)
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(6))
                .location(null) // Null location
                .fee(0.0)
                .details("Draft Details")
                .build();
        when(eventService.saveEventAsDraft(invalidRequest))
                .thenThrow(new ConstraintViolationException("Location is required", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.saveEventAsDraft(invalidRequest));
        verify(eventService).saveEventAsDraft(invalidRequest);
    }

    // --- 3. getAllEvents tests ---
    @Test
    void testGetAllEvents_Success() throws IOException {
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Event A").build(),
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Event B").build()
        );
        when(eventService.getAllEvents()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getAllEvents();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(eventService).getAllEvents();
    }

    @Test
    void testGetAllEvents_NoEventsFound() throws IOException {
        when(eventService.getAllEvents()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getAllEvents();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        verify(eventService).getAllEvents();
    }

    // --- 4. getUpcomingEvents tests ---
    @Test
    void testGetUpcomingEvents_Success() {
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Upcoming Event 1").status(EventStatus.APPROVED).build(),
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Upcoming Event 2").status(EventStatus.APPROVED).build()
        );
        when(eventService.getUpcomingEvents()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getUpcomingEvents();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(eventService).getUpcomingEvents();
    }

    @Test
    void testGetUpcomingEvents_NoUpcomingEventsFound() {
        when(eventService.getUpcomingEvents()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getUpcomingEvents();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(eventService).getUpcomingEvents();
    }

    // --- 5. getEvent (by ID) tests ---
    @Test
    void testGetEventById_Success() {
        UUID id = UUID.randomUUID();
        EventResponse mockResponse = EventResponse.builder().eventID(id).eventName("Specific Event").build();
        when(eventService.getEvent(id)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<EventResponse>> response = eventController.getEvent(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(id, response.getBody().getData().getEventID());
        verify(eventService).getEvent(id);
    }

    @Test
    void testGetEventById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(eventService.getEvent(nonExistentId)).thenThrow(new NoSuchElementException("Event not found by ID"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> eventController.getEvent(nonExistentId));
        assertTrue(exception.getMessage().contains("Event not found by ID"));
        verify(eventService).getEvent(nonExistentId);
    }

    // --- 6. getManagerEvents tests ---
    @Test
    void testGetManagerEvents_Success() {
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Manager Event 1").build(),
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Manager Event 2").build()
        );
        when(eventService.getEventsByStaff()).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getManagerEvents();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(eventService).getEventsByStaff();
    }

    @Test
    void testGetManagerEvents_NoEventsForManager() {
        when(eventService.getEventsByStaff()).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getManagerEvents();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(eventService).getEventsByStaff();
    }

    // --- 7. getEventsByManager tests ---
    @Test
    void testGetEventsByManager_Success() {
        String username = "staffUser";
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Staff Event 1").build(),
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Staff Event 2").build()
        );
        when(eventService.getEventsByStaff(username)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getEventsByManager(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        verify(eventService).getEventsByStaff(username);
    }

    @Test
    void testGetEventsByManager_NoEventsForSpecificManager() {
        String username = "noEventsUser";
        when(eventService.getEventsByStaff(username)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getEventsByManager(username);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(eventService).getEventsByStaff(username);
    }

    // --- 8. updateEvent tests ---
    @Test
    void testUpdateEvent_Success() {
        UUID id = UUID.randomUUID();
        UpdateEventRequest request = UpdateEventRequest.builder()
                .eventName("Updated Event")
                .duration(90)
                .quantity(150)
                .description("Updated Description")
                .status(EventStatus.EXPIRED)
                .ageGroup(AgeGroup.ADOLESCENT)
                .startDate(LocalDateTime.now().plusDays(3))
                .endDate(LocalDateTime.now().plusDays(4))
                .location("Venue B")
                .fee(20.0)
                .details("Updated Details")
                .build();
        EventResponse updatedResponse = EventResponse.builder()
                .eventID(id)
                .eventName("Updated Event")
                .status(EventStatus.EXPIRED)
                .build();
        when(eventService.updateEvent(id, request)).thenReturn(updatedResponse);

        ResponseEntity<ApiResponse<EventResponse>> response = eventController.updateEvent(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated Event", response.getBody().getData().getEventName());
        assertEquals("Event updated successfully", response.getBody().getMessage());
        verify(eventService).updateEvent(id, request);
    }

    @Test
    void testUpdateEvent_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateEventRequest request = UpdateEventRequest.builder()
                .eventName("Update Attempt")
                .duration(60)
                .quantity(100)
                .description("Desc")
                .status(EventStatus.APPROVED)
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Loc")
                .fee(10.0)
                .details("D")
                .build();
        when(eventService.updateEvent(nonExistentId, request)).thenThrow(new NoSuchElementException("Event to update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> eventController.updateEvent(nonExistentId, request));
        assertTrue(exception.getMessage().contains("Event to update not found"));
        verify(eventService).updateEvent(nonExistentId, request);
    }

    @Test
    void testUpdateEvent_InvalidInput_EventNameBlank() {
        UUID id = UUID.randomUUID();
        UpdateEventRequest invalidRequest = UpdateEventRequest.builder()
                .eventName("") // Blank name
                .duration(60)
                .quantity(100)
                .description("Desc")
                .status(EventStatus.APPROVED)
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Loc")
                .fee(10.0)
                .details("D")
                .build();
        when(eventService.updateEvent(id, invalidRequest))
                .thenThrow(new ConstraintViolationException("Event name must not be blank", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.updateEvent(id, invalidRequest));
        verify(eventService).updateEvent(id, invalidRequest);
    }

    @Test
    void testUpdateEvent_InvalidInput_DurationNegative() {
        UUID id = UUID.randomUUID();
        UpdateEventRequest invalidRequest = UpdateEventRequest.builder()
                .eventName("Valid Name")
                .duration(-5) // Negative duration
                .quantity(100)
                .description("Desc")
                .status(EventStatus.APPROVED)
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Loc")
                .fee(10.0)
                .details("D")
                .build();
        when(eventService.updateEvent(id, invalidRequest))
                .thenThrow(new ConstraintViolationException("Duration must be a positive number", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.updateEvent(id, invalidRequest));
        verify(eventService).updateEvent(id, invalidRequest);
    }

    @Test
    void testUpdateEvent_InvalidInput_FeeNegative() {
        UUID id = UUID.randomUUID();
        UpdateEventRequest invalidRequest = UpdateEventRequest.builder()
                .eventName("Valid Name")
                .duration(60)
                .quantity(100)
                .description("Desc")
                .status(EventStatus.APPROVED)
                .ageGroup(AgeGroup.ADULT)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Loc")
                .fee(-1.0) // Negative fee
                .details("D")
                .build();
        when(eventService.updateEvent(id, invalidRequest))
                .thenThrow(new ConstraintViolationException("Fee cannot be negative", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> eventController.updateEvent(id, invalidRequest));
        verify(eventService).updateEvent(id, invalidRequest);
    }

    // --- 9. updateEventStatus tests ---
    @Test
    void testUpdateEventStatus_Success() {
        UUID id = UUID.randomUUID();
        EventStatus newStatus = EventStatus.CANCELLED;
        EventResponse mockResponse = EventResponse.builder()
                .eventID(id)
                .eventName("Event A")
                .status(newStatus)
                .build();
        when(eventService.updateEventStatus(id, newStatus)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<EventResponse>> response = eventController.updateEventStatus(id, newStatus);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(newStatus, response.getBody().getData().getStatus());
        verify(eventService).updateEventStatus(id, newStatus);
    }

    @Test
    void testUpdateEventStatus_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        EventStatus newStatus = EventStatus.CANCELLED;
        when(eventService.updateEventStatus(nonExistentId, newStatus)).thenThrow(new NoSuchElementException("Event for status update not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> eventController.updateEventStatus(nonExistentId, newStatus));
        assertTrue(exception.getMessage().contains("Event for status update not found"));
        verify(eventService).updateEventStatus(nonExistentId, newStatus);
    }

    // --- 10. registerEvent tests ---
    @Test
    void testRegisterEvent_Success() {
        UUID eventId = UUID.randomUUID();
        doNothing().when(eventService).registerUserToEvent(eventId);

        ResponseEntity<ApiResponse<String>> response = eventController.registerEvent(eventId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Registered successfully", response.getBody().getData());
        verify(eventService).registerUserToEvent(eventId);
    }

    @Test
    void testRegisterEvent_EventNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        doThrow(new NoSuchElementException("Event for registration not found")).when(eventService).registerUserToEvent(nonExistentId);

        Exception exception = assertThrows(NoSuchElementException.class, () -> eventController.registerEvent(nonExistentId));
        assertTrue(exception.getMessage().contains("Event for registration not found"));
        verify(eventService).registerUserToEvent(nonExistentId);
    }

    // --- 11. cancelRegistration tests ---
    @Test
    void testCancelRegistration_Success() {
        UUID eventId = UUID.randomUUID();
        doNothing().when(eventService).cancelEventRegistration(eventId);

        ResponseEntity<Void> response = eventController.cancelRegistration(eventId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(eventService).cancelEventRegistration(eventId);
    }

    @Test
    void testCancelRegistration_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        doThrow(new NoSuchElementException("Event registration not found to cancel")).when(eventService).cancelEventRegistration(nonExistentId);

        Exception exception = assertThrows(NoSuchElementException.class, () -> eventController.cancelRegistration(nonExistentId));
        assertTrue(exception.getMessage().contains("Event registration not found to cancel"));
        verify(eventService).cancelEventRegistration(nonExistentId);
    }

    // --- 12. getEventStatus tests ---
    @Test
    void testGetEventStatus_Success() {
        UUID eventId = UUID.randomUUID();

        EventStatusResponse mockResponse = EventStatusResponse.builder()
                .status(EventUserStatus.REGISTERED)
                .isFull(false)
                .build();

        when(eventService.getEventStatus(eq(eventId), anyString())).thenReturn(mockResponse);

        ResponseEntity<EventStatusResponse> response = eventController.getEventStatus(eventId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(EventUserStatus.REGISTERED, response.getBody().getStatus());
        assertFalse(response.getBody().isFull());

        verify(eventService).getEventStatus(eq(eventId), anyString());
    }


    @Test
    void testGetEventStatus_EventNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(eventService.getEventStatus(eq(nonExistentId), anyString())).thenThrow(new NoSuchElementException("Event for status check not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> eventController.getEventStatus(nonExistentId));
        assertTrue(exception.getMessage().contains("Event for status check not found"));
        verify(eventService).getEventStatus(eq(nonExistentId), anyString());
    }

    // --- 13. getEventsByUserAgeGroup tests ---
    @Test
    void testGetEventsByUserAgeGroup_Success() {
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("User Age Group Event 1").build(),
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("User Age Group Event 2").build()
        );
        when(eventService.getEventsForCurrentUser(anyString())).thenReturn(mockList);

        ResponseEntity<List<EventResponse>> response = eventController.getEventsByUserAgeGroup();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(eventService).getEventsForCurrentUser(anyString());
    }

    @Test
    void testGetEventsByUserAgeGroup_NoEventsFound() {
        when(eventService.getEventsForCurrentUser(anyString())).thenReturn(Collections.emptyList());

        ResponseEntity<List<EventResponse>> response = eventController.getEventsByUserAgeGroup();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(eventService).getEventsForCurrentUser(anyString());
    }

    // --- 14. getEventsByAgeGroup tests ---
    @Test
    void testGetEventsByAgeGroup_Success() {
        AgeGroup ageGroup = AgeGroup.ADOLESCENT;
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Children Event 1").ageGroup(AgeGroup.ADOLESCENT).build()
        );
        when(eventService.getEventsByAgeGroup(ageGroup)).thenReturn(mockList);

        ResponseEntity<List<EventResponse>> response = eventController.getEventsByAgeGroup(ageGroup);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(AgeGroup.ADOLESCENT, response.getBody().get(0).getAgeGroup());
        verify(eventService).getEventsByAgeGroup(ageGroup);
    }

    @Test
    void testGetEventsByAgeGroup_NoEventsFound() {
        AgeGroup ageGroup = AgeGroup.SENIOR;
        when(eventService.getEventsByAgeGroup(ageGroup)).thenReturn(Collections.emptyList());

        ResponseEntity<List<EventResponse>> response = eventController.getEventsByAgeGroup(ageGroup);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(eventService).getEventsByAgeGroup(ageGroup);
    }

    // --- 15. getMyEvents tests ---
    @Test
    void testGetMyEvents_Success() {
        String memberId = "member123";
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("My Event 1").build(),
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("My Event 2").build()
        );
        when(eventService.getEventsByMember(memberId)).thenReturn(mockList);

        List<EventResponse> response = eventController.getMyEvents(memberId);

        assertNotNull(response);
        assertEquals(2, response.size());
        verify(eventService).getEventsByMember(memberId);
    }

    @Test
    void testGetMyEvents_NoEventsFound() {
        String memberId = "member456";
        when(eventService.getEventsByMember(memberId)).thenReturn(Collections.emptyList());

        List<EventResponse> response = eventController.getMyEvents(memberId);

        assertNotNull(response);
        assertTrue(response.isEmpty());
        verify(eventService).getEventsByMember(memberId);
    }

    // --- 16. importEventsFromExcel tests ---
    @Test
    void testImportEventsFromExcel_Success() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        InputStream mockInputStream = new ByteArrayInputStream("dummy excel data".getBytes());
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenReturn(mockInputStream);
        doNothing().when(excelService).importEventsFromExcel(any(InputStream.class));

        ResponseEntity<String> response = eventController.importEventsFromExcel(mockFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Excel file data saved Events into DB", response.getBody());
        verify(excelService).importEventsFromExcel(mockInputStream);
    }

    @Test
    void testImportEventsFromExcel_EmptyFile() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        ResponseEntity<String> response = eventController.importEventsFromExcel(mockFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("File is empty!", response.getBody());
        verify(mockFile).isEmpty();
        verifyNoInteractions(excelService);
    }

    @Test
    void testImportEventsFromExcel_IOException() throws IOException {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getInputStream()).thenThrow(new IOException("Simulated file read error"));

        Exception exception = assertThrows(IOException.class, () -> eventController.importEventsFromExcel(mockFile));
        assertTrue(exception.getMessage().contains("Simulated file read error"));
        verify(mockFile).getInputStream();
        verifyNoInteractions(excelService);
    }

    // --- 17. getEventsByStatus tests ---
    @Test
    void testGetEventsByStatus_Success() {
        EventStatus status = EventStatus.APPROVED;
        List<EventResponse> mockList = Arrays.asList(
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Completed Event 1").status(EventStatus.APPROVED).build(),
                EventResponse.builder().eventID(UUID.randomUUID()).eventName("Completed Event 2").status(EventStatus.APPROVED).build()
        );
        when(eventService.getEventsByStatus(status)).thenReturn(mockList);

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getEventsByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals(EventStatus.APPROVED, response.getBody().getData().get(0).getStatus());
        verify(eventService).getEventsByStatus(status);
    }

    @Test
    void testGetEventsByStatus_NoEventsFound() {
        EventStatus status = EventStatus.CANCELLED;
        when(eventService.getEventsByStatus(status)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<EventResponse>>> response = eventController.getEventsByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getData().isEmpty());
        verify(eventService).getEventsByStatus(status);
    }

    // --- 18. getAllEventStatuses tests ---
    @Test
    void testGetAllEventStatuses_Success() {
        ResponseEntity<ApiResponse<List<String>>> response = eventController.getAllEventStatuses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        List<String> statuses = response.getBody().getData();
        assertEquals(EventStatus.values().length, statuses.size());
        assertTrue(statuses.contains(EventStatus.DRAFT.name()));
        assertTrue(statuses.contains(EventStatus.PENDING_APPROVAL.name()));
        assertTrue(statuses.contains(EventStatus.NOT_STARTED.name()));
        assertTrue(statuses.contains(EventStatus.REJECTED.name()));
        assertTrue(statuses.contains(EventStatus.ONGOING.name()));
        assertTrue(statuses.contains(EventStatus.CANCELLED.name()));
        assertTrue(statuses.contains(EventStatus.EXPIRED.name()));
        assertTrue(statuses.contains(EventStatus.APPROVED.name()));
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
    }

    @Test
    void publishEvent_shouldReturnCreatedStatusAndSuccessMessage() {
        // Given
        // Tạo một đối tượng CreateEventRequest giả định
        CreateEventRequest request = CreateEventRequest.builder()
                .eventName("Test Event")
                .description("This is a test event.")
                .build();

        // Tạo một đối tượng EventResponse giả định mà service sẽ trả về
        EventResponse mockResponse = EventResponse.builder()
                .eventName("Test Event")
                .status(EventStatus.APPROVED)
                .build();

        // Khi eventService.publishEvent được gọi với bất kỳ CreateEventRequest nào,
        // nó sẽ trả về mockResponse
        when(eventService.publishEvent(any(CreateEventRequest.class))).thenReturn(mockResponse);

        // When
        // Gọi phương thức publishEvent của controller
        ResponseEntity<ApiResponse<EventResponse>> responseEntity = eventController.publishEvent(request);

        // Then
        // Kiểm tra mã trạng thái HTTP
        assertNotNull(responseEntity);
        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());

        // Kiểm tra nội dung của ApiResponse
        ApiResponse<EventResponse> apiResponse = responseEntity.getBody();
        assertNotNull(apiResponse);
        assertEquals(HttpStatus.CREATED.value(), apiResponse.getStatus());
        assertEquals("Event submitted for approval successfully.", apiResponse.getMessage());
        assertNotNull(apiResponse.getData());
        assertEquals(mockResponse.getEventName(), apiResponse.getData().getEventName());
        assertEquals(mockResponse.getStatus(), apiResponse.getData().getStatus());

        // Xác minh rằng eventService.publishEvent đã được gọi chính xác một lần
        verify(eventService).publishEvent(any(CreateEventRequest.class));
    }
}