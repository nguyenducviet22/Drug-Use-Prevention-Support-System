package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
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
import com.swp.drug_use_prevention_support_system.exception.ResourceNotFoundException;
import com.swp.drug_use_prevention_support_system.mappers.EventMapper;
import com.swp.drug_use_prevention_support_system.repositories.EventRepository;
import com.swp.drug_use_prevention_support_system.repositories.EventUserRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.swp.drug_use_prevention_support_system.exception.AgeGroupMismatchException;
import com.swp.drug_use_prevention_support_system.exception.AlreadyRegisteredException;
import com.swp.drug_use_prevention_support_system.exception.EventFullException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventUserRepository eventUserRepository;
    private final EventMapper eventMapper;
    private final UserService userService;

    //CRUDs for Events

    @PreAuthorize("hasAnyRole('MANAGER')")
    public EventResponse createEvent(CreateEventRequest eventRequest) {
        Event newEvent = eventMapper.toEntity(eventRequest);
        String loginUsername = userService.getLoginUsername();
        User staff = userService.getUserEntity(loginUsername);
        newEvent.setCreatedByStaff(staff);
        eventRepository.save(newEvent);
        return eventMapper.toDto(newEvent);
    }

    public List<EventResponse> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream()
                .map(event -> eventMapper.toDto(event))
                .toList();
    }

    public List<EventResponse> getUpcomingEvents() {
        List<Event> events = eventRepository.findByStartDateAfter(LocalDateTime.now());
        return events.stream().map(eventMapper::toDto).toList();
    }



    public EventResponse getEvent(UUID eventID) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new EntityNotFoundException("Event does not exist with ID: " + eventID));
        return eventMapper.toDto(event);
    }

    @PreAuthorize("hasAnyRole('STAFF')")
    public List<EventResponse> getEventsByStaff() {
        String loginUsername = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(loginUsername);
        List<Event> events = eventRepository.findEventsCreatedBy(loginUser);
        return events.stream().map(eventMapper::toDto).toList();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public List<EventResponse> getEventsByStaff(String username) {
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

    //Đăng kí sự kiện

    @PreAuthorize("hasRole('MEMBER')")
    public void registerUserToEvent(UUID eventId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long currentRegistrations = eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED);
        if (currentRegistrations >= event.getQuantity()) {
            throw new EventFullException("This event has reached its maximum number of participants.");
        }

        if (event.getAgeGroup() != AgeGroup.EVERYONE &&
                user.getAgeGroup() != event.getAgeGroup()) {
            throw new AgeGroupMismatchException("Your age group does not match this event.");
        }

        EventUserId id = new EventUserId(eventId, username);
        Optional<EventUser> existing = eventUserRepository.findById(id);

        if (existing.isPresent()) {
            EventUser userEvent = existing.get();
            if (userEvent.getStatus() == EventUserStatus.REGISTERED) {
                throw new AlreadyRegisteredException("You have already registered for this event.");
            } else {
                // Đã từng hủy → đăng ký lại
                userEvent.setStatus(EventUserStatus.REGISTERED);
                userEvent.setJoinAt(LocalDateTime.now());
                eventUserRepository.save(userEvent);
                return;
            }
        }

        EventUser userEvent = new EventUser();
        userEvent.setEventId(eventId);
        userEvent.setMemberId(username);
        userEvent.setJoinAt(LocalDateTime.now());
        userEvent.setStatus(EventUserStatus.REGISTERED);

        eventUserRepository.save(userEvent);
    }

    @PreAuthorize("hasRole('MEMBER')")
    //Lấy status của người đăng kí sự kiện
    public EventStatusResponse getEventStatus(UUID eventId, String username) {
        Optional<EventUser> eventUser = eventUserRepository.findById(new EventUserId(eventId, username));

        EventUserStatus status = eventUser
                .map(EventUser::getStatus)
                .map(eventUserStatus -> switch (eventUserStatus) {
                    case REGISTERED -> EventUserStatus.REGISTERED;
                    case CANCELLED  -> EventUserStatus.CANCELLED;
                    default -> throw new IllegalStateException("Unknown status: " + eventUser.get().getStatus());
                })
                .orElse(EventUserStatus.NOT_REGISTERED);

        long registeredCount = eventUserRepository.countByEventIdAndStatus(eventId, EventUserStatus.REGISTERED);
        boolean isFull = eventRepository.findById(eventId)
                .map(event -> registeredCount >= event.getQuantity())
                .orElse(false); // hoặc throw ResourceNotFoundException nếu bạn muốn

        return new EventStatusResponse(status, isFull);
    }

    //Lấy Reccomendations dựa trên Age Group
    @PreAuthorize("hasRole('MEMBER')")
    public List<EventResponse> getEventsForCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AgeGroup ageGroup = user.getAgeGroup();
        List<AgeGroup> groups = List.of(ageGroup, AgeGroup.EVERYONE);

        List<Event> events = eventRepository.findByAgeGroupIn(groups);
        return events.stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('MEMBER')")
    public List<EventResponse> getEventsByAgeGroup(AgeGroup ageGroup) {
        List<AgeGroup> groups = List.of(ageGroup, AgeGroup.EVERYONE);
        List<Event> events = eventRepository.findByAgeGroupIn(groups);
        return events.stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('MEMBER')")
    public List<EventResponse> getEventsByMember(String memberId) {
        return eventUserRepository.findByMemberId(memberId).stream()
                .map(EventUser::getEventId)
                .map(eventRepository::findById)
                .flatMap(Optional::stream) // tự động bỏ qua Optional.empty()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }

}
