package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.SaveAsDraftRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventStatusResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Event;
import com.swp.drug_use_prevention_support_system.domain.entities.EventUser;
import com.swp.drug_use_prevention_support_system.domain.entities.EventUserId;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.EventUserStatus;
import com.swp.drug_use_prevention_support_system.exception.*;
import com.swp.drug_use_prevention_support_system.mappers.EventMapper;
import com.swp.drug_use_prevention_support_system.repositories.EventRepository;
import com.swp.drug_use_prevention_support_system.repositories.EventUserRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EventServiceTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventUserRepository eventUserRepository;
    @Mock
    private EventMapper eventMapper;
    @Mock
    private UserService userService;

    @InjectMocks
    private EventService eventService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Reset SecurityContext for each test
        SecurityContextHolder.clearContext();
    }

    @Test
    void testCreateEvent_Success() {
        CreateEventRequest request = mock(CreateEventRequest.class);
        Event event = new Event();
        EventResponse response = new EventResponse();
        User staff = new User();
        String username = "staffUser";

        when(eventMapper.toEntity(request)).thenReturn(event);
        when(userService.getLoginUsername()).thenReturn(username);
        when(userService.getUserEntity(username)).thenReturn(staff);
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toDto(event)).thenReturn(response);

        EventResponse result = eventService.createEvent(request);

        assertEquals(response, result);
        assertEquals(staff, event.getCreatedByStaff());
        verify(eventRepository).save(event);
    }

    @Test
    void testRegisterUserToEvent_Success() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        Event event = new Event();
        event.setQuantity(10);
        event.setAgeGroup(AgeGroup.ADULT);
        User user = new User();
        user.setAgeGroup(AgeGroup.ADULT);

        mockSecurityContext(username);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED)).thenReturn(5L);
        when(eventUserRepository.findById(any(EventUserId.class))).thenReturn(Optional.empty());

        eventService.registerUserToEvent(eventId);

        ArgumentCaptor<EventUser> captor = ArgumentCaptor.forClass(EventUser.class);
        verify(eventUserRepository).save(captor.capture());
        EventUser saved = captor.getValue();
        assertEquals(eventId, saved.getEventId());
        assertEquals(username, saved.getMemberId());
        assertEquals(EventUserStatus.REGISTERED, saved.getStatus());
    }

    @Test
    void testUpdateEvent_Success() {
        UUID eventId = UUID.randomUUID();
        UpdateEventRequest request = mock(UpdateEventRequest.class);
        Event event = new Event();
        EventResponse response = new EventResponse();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toDto(event)).thenReturn(response);

        // Setters for request
        when(request.getEventName()).thenReturn("Updated Name");
        when(request.getSubTitle()).thenReturn("Updated Subtitle");
        when(request.getDuration()).thenReturn(2);
        when(request.getQuantity()).thenReturn(100);
        when(request.getDescription()).thenReturn("Updated Desc");
        when(request.getImage()).thenReturn("img.png");
        when(request.getStatus()).thenReturn(EventStatus.APPROVED);
        when(request.getStartDate()).thenReturn(LocalDateTime.now());
        when(request.getEndDate()).thenReturn(LocalDateTime.now().plusDays(1));
        when(request.getAgeGroup()).thenReturn(AgeGroup.ADULT);
        when(request.getLocation()).thenReturn("Updated Location");
        when(request.getFee()).thenReturn(50.0);
        when(request.getDetails()).thenReturn("Updated Details");

        EventResponse result = eventService.updateEvent(eventId, request);

        assertEquals(response, result);
        verify(eventRepository).save(event);
    }

    @Test
    void testRegisterUserToEvent_EventFull() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        Event event = new Event();
        event.setQuantity(2);
        event.setAgeGroup(AgeGroup.ADULT);
        User user = new User();
        user.setAgeGroup(AgeGroup.ADULT);

        mockSecurityContext(username);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED)).thenReturn(2L);

        assertThrows(EventFullException.class, () -> eventService.registerUserToEvent(eventId));
    }

    @Test
    void testCancelEventRegistration_TooLate() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        Event event = new Event();
        event.setStatus(EventStatus.APPROVED);
        event.setStartDate(LocalDateTime.now().plusDays(2));
        event.setEndDate(LocalDateTime.now().plusDays(5));
        EventUser userEvent = new EventUser();
        userEvent.setStatus(EventUserStatus.REGISTERED);

        mockSecurityContext(username);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventUserRepository.findById(new EventUserId(eventId, username))).thenReturn(Optional.of(userEvent));

        assertThrows(CancellationNotAllowedException.class, () -> eventService.cancelEventRegistration(eventId));
    }

    @Test
    void testSaveEventAsDraft_MissingEventName() {
        SaveAsDraftRequest request = mock(SaveAsDraftRequest.class);
        Event event = new Event();
        String username = "staffUser";
        User staff = new User();

        when(eventMapper.toEntity(request)).thenReturn(event);
        when(userService.getLoginUsername()).thenReturn(username);
        when(userService.getUserEntity(username)).thenReturn(staff);
        event.setEventName("   "); // blank

        InvalidEventException ex = assertThrows(InvalidEventException.class, () -> eventService.saveEventAsDraft(request));
        assertTrue(ex.getMessage().contains("Event name is required"));
    }

    @Test
    void testRegisterUserToEvent_AgeGroupMismatch() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        Event event = new Event();
        event.setQuantity(10);
        event.setAgeGroup(AgeGroup.ADULT);
        User user = new User();
        user.setAgeGroup(AgeGroup.SENIOR);

        mockSecurityContext(username);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED)).thenReturn(0L);

        assertThrows(AgeGroupMismatchException.class, () -> eventService.registerUserToEvent(eventId));
    }

    @Test
    void testGetEventsForCurrentUser_Recommendations() {
        String username = "member1";
        User user = new User();
        user.setAgeGroup(AgeGroup.ADULT);
        Event event1 = new Event();
        event1.setAgeGroup(AgeGroup.ADULT);
        Event event2 = new Event();
        event2.setAgeGroup(AgeGroup.EVERYONE);
        List<Event> events = Arrays.asList(event1, event2);
        EventResponse resp1 = new EventResponse();
        EventResponse resp2 = new EventResponse();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(eventRepository.findByAgeGroupIn(Arrays.asList(AgeGroup.ADULT, AgeGroup.EVERYONE))).thenReturn(events);
        when(eventMapper.toDto(event1)).thenReturn(resp1);
        when(eventMapper.toDto(event2)).thenReturn(resp2);

        List<EventResponse> result = eventService.getEventsForCurrentUser(username);

        assertEquals(2, result.size());
        assertTrue(result.contains(resp1));
        assertTrue(result.contains(resp2));
    }

    @Test
    void testCancelEventRegistration_EventEndedOrCancelled() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        Event event = new Event();
        event.setStatus(EventStatus.CANCELLED);
        event.setEndDate(LocalDateTime.now().minusDays(1));
        EventUser userEvent = new EventUser();
        userEvent.setStatus(EventUserStatus.REGISTERED);

        mockSecurityContext(username);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventUserRepository.findById(new EventUserId(eventId, username))).thenReturn(Optional.of(userEvent));

        assertThrows(EventCancellationBlockedException.class, () -> eventService.cancelEventRegistration(eventId));
    }

    @Test
    void testGetEventStatus_Success() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        EventUser eventUser = new EventUser();
        eventUser.setStatus(EventUserStatus.REGISTERED);
        Event event = new Event();
        event.setQuantity(2);

        when(eventUserRepository.findById(new EventUserId(eventId, username))).thenReturn(Optional.of(eventUser));
        when(eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED)).thenReturn(2L);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        EventStatusResponse result = eventService.getEventStatus(eventId, username);

        assertEquals(EventUserStatus.REGISTERED, result.getStatus());
        assertTrue(result.isFull());
    }

    @Test
    void testRegisterUserToEvent_ReRegisterAfterCancellation() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        Event event = new Event();
        event.setQuantity(10);
        event.setAgeGroup(AgeGroup.ADULT);
        User user = new User();
        user.setAgeGroup(AgeGroup.ADULT);
        EventUser existingUserEvent = new EventUser();
        existingUserEvent.setStatus(EventUserStatus.NOT_REGISTERED);

        mockSecurityContext(username);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED)).thenReturn(0L);
        when(eventUserRepository.findById(new EventUserId(eventId, username))).thenReturn(Optional.of(existingUserEvent));

        eventService.registerUserToEvent(eventId);

        assertEquals(EventUserStatus.REGISTERED, existingUserEvent.getStatus());
        verify(eventUserRepository).save(existingUserEvent);
    }

    @Test
    void testPublishEvent_Success() {
        CreateEventRequest request = mock(CreateEventRequest.class);
        Event event = new Event();
        EventResponse response = new EventResponse();
        String username = "staffUser";
        User staff = new User();

        when(eventMapper.toEntity(request)).thenReturn(event);
        when(userService.getLoginUsername()).thenReturn(username);
        when(userService.getUserEntity(username)).thenReturn(staff);
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toDto(event)).thenReturn(response);

        EventResponse result = eventService.publishEvent(request);

        assertEquals(EventStatus.PENDING_APPROVAL, event.getStatus());
        assertEquals(staff, event.getCreatedByStaff());
        assertEquals(response, result);
        verify(eventRepository).save(event);
    }

    @Test
    void testRegisterUserToEvent_AlreadyRegistered() {
        UUID eventId = UUID.randomUUID();
        String username = "member1";
        Event event = new Event();
        event.setQuantity(10);
        event.setAgeGroup(AgeGroup.ADULT);
        User user = new User();
        user.setAgeGroup(AgeGroup.ADULT);
        EventUser existingUserEvent = new EventUser();
        existingUserEvent.setStatus(EventUserStatus.REGISTERED);

        mockSecurityContext(username);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED)).thenReturn(0L);
        when(eventUserRepository.findById(new EventUserId(eventId, username))).thenReturn(Optional.of(existingUserEvent));

        assertThrows(AlreadyRegisteredException.class, () -> eventService.registerUserToEvent(eventId));
    }

    @Test
    void testGetEventsByMember_RegisteredEventsOnly() {
        String memberId = "member1";
        UUID eventId1 = UUID.randomUUID();
        UUID eventId2 = UUID.randomUUID();
        EventUser eu1 = new EventUser(eventId1, memberId, LocalDateTime.now(), EventUserStatus.REGISTERED);
        EventUser eu2 = new EventUser(eventId2, memberId, LocalDateTime.now(), EventUserStatus.CANCELLED);
        Event event1 = new Event();
        Event event2 = new Event();
        EventResponse resp1 = new EventResponse();

        when(eventUserRepository.findByMemberId(memberId)).thenReturn(Arrays.asList(eu1, eu2));
        when(eventRepository.findById(eventId1)).thenReturn(Optional.of(event1));
        when(eventRepository.findById(eventId2)).thenReturn(Optional.empty());
        when(eventMapper.toDto(event1)).thenReturn(resp1);

        List<EventResponse> result = eventService.getEventsByMember(memberId);

        assertEquals(1, result.size());
        assertEquals(resp1, result.get(0));
    }

    // Helper for mocking SecurityContext
    private void mockSecurityContext(String username) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(username);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }
}