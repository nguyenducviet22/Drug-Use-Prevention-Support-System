package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Event;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.mappers.EventMapper;
import com.swp.drug_use_prevention_support_system.repositories.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final UserService userService;

    @PreAuthorize("hasAnyRole('MANAGER')")
    public EventResponse createEvent(CreateEventRequest eventRequest) {
        Event newEvent = eventMapper.toEntity(eventRequest);
        String loginUsername = userService.getLoginUsername();
        User manager = userService.getUserEntity(loginUsername);
        newEvent.setCreatedBy(manager);
        eventRepository.save(newEvent);
        return eventMapper.toDto(newEvent);
    }

    public List<EventResponse> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream()
                .map(event -> eventMapper.toDto(event))
                .toList();
    }

    public EventResponse getEvent(UUID eventID) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new EntityNotFoundException("Event does not exist with ID: " + eventID));
        return eventMapper.toDto(event);
    }

    @PreAuthorize("hasAnyRole('MANAGER')")
    public List<EventResponse> getEventsByManager() {
        String loginUsername = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(loginUsername);
        List<Event> events = eventRepository.findEventsCreatedBy(loginUser);
        return events.stream().map(eventMapper::toDto).toList();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public List<EventResponse> getEventsByManager(String username) {
        List<Event> events = eventRepository.findEventsByCreatedByUsername(username);
        return events.stream().map(eventMapper::toDto).toList();
    }

    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER')")
    public EventResponse updateEvent(UUID eventId, UpdateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event does not exist with ID: " + eventId));

        event.setEventName(request.getEventName());
        event.setDuration(request.getDuration());
        event.setQuantity(request.getQuantity());
        event.setDescription(request.getDescription());
        event.setImg(request.getImg());
        event.setStatus(request.getStatus());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setAgeGroup(request.getAgeGroup());

        eventRepository.save(event);
        return eventMapper.toDto(event);
    }

    @PreAuthorize("hasAnyRole('MANAGER')")
    public EventResponse updateEventStatus(UUID eventId, EventStatus status) {
        Event event = eventMapper.toEntity(getEvent(eventId));
        event.setStatus(status);
        eventRepository.save(event);
        return eventMapper.toDto(event);
    }
}
