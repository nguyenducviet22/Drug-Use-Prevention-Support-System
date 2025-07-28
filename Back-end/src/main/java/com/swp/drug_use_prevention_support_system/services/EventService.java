package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.SaveAsDraftRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateEventRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CourseResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.EventStatusResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.*;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.EventUserStatus;
import com.swp.drug_use_prevention_support_system.exception.*;
import com.swp.drug_use_prevention_support_system.mappers.EventMapper;
import com.swp.drug_use_prevention_support_system.repositories.EventRepository;
import com.swp.drug_use_prevention_support_system.repositories.EventUserRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
    @PreAuthorize("hasAnyRole('STAFF')")
    public EventResponse createEvent(CreateEventRequest eventRequest) {
        Event newEvent = eventMapper.toEntity(eventRequest);
        String loginUsername = userService.getLoginUsername();
        User staff = userService.getUserEntity(loginUsername);
        newEvent.setCreatedByStaff(staff);
        eventRepository.save(newEvent);
        return eventMapper.toDto(newEvent);
    }

    // Lưu event dưới dạng DRAFT
    @PreAuthorize("hasAnyRole('STAFF')")
    public EventResponse saveEventAsDraft(SaveAsDraftRequest eventRequest) {
        Event newEvent = eventMapper.toEntity(eventRequest);
        String loginUsername = userService.getLoginUsername();
        User staff = userService.getUserEntity(loginUsername);
        newEvent.setCreatedByStaff(staff);
        newEvent.setStatus(EventStatus.DRAFT);
        if (newEvent.getEventName() == null || newEvent.getEventName().trim().isEmpty()) {
            throw new InvalidEventException("Event name is required even for a draft.");
        }
        eventRepository.save(newEvent);
        return eventMapper.toDto(newEvent);
    }

    @PreAuthorize("hasAnyRole('STAFF')")
    @Transactional
    public EventResponse publishEvent(CreateEventRequest request) {
        Event newEvent = eventMapper.toEntity(request); // Bạn cần thêm phương thức map này trong EventMapper
        newEvent.setStatus(EventStatus.PENDING_APPROVAL); // Luôn đặt trạng thái là PENDING_APPROVAL
        String loginUsername = userService.getLoginUsername();
        User staff = userService.getUserEntity(loginUsername);
        newEvent.setCreatedByStaff(staff);

        // Các validation từ PublishEventRequest DTO sẽ đảm bảo dữ liệu hợp lệ
        // Thêm các logic nghiệp vụ khác nếu cần trước khi lưu
        // Ví dụ: kiểm tra trùng lặp, tính toán lại endDate nếu duration thay đổi, v.v.

        eventRepository.save(newEvent);
        return eventMapper.toDto(newEvent);
    }

    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    public List<EventResponse> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream()
                .map(event -> eventMapper.toDto(event))
                .toList();
    }

    public List<EventResponse> getActiveAndExpiredEvents() {
        List<EventStatus> allowedStatuses = List.of(
                EventStatus.NOT_STARTED,
                EventStatus.ONGOING,
                EventStatus.EXPIRED
        );

        return eventRepository.findByStatusIn(allowedStatuses).stream()
                .map(eventMapper::toDto)
                .toList();
    }


    public List<EventResponse> getUpcomingEvents() {
        List<Event> events = eventRepository.findByStartDateAfterAndStatus(
                LocalDateTime.now(),
                EventStatus.NOT_STARTED
        );

        return events.stream()
                .map(eventMapper::toDto)
                .toList();
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

    @PreAuthorize("hasAnyRole('STAFF')")
    public EventResponse updateEvent(UUID eventId, UpdateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event does not exist with ID: " + eventId));

        event.setEventName(request.getEventName());
        event.setSubTitle(request.getSubTitle());
        event.setDuration(request.getDuration());
        event.setQuantity(request.getQuantity());
        event.setDescription(request.getDescription());
        event.setImage(request.getImage());
        event.setStatus(request.getStatus());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setAgeGroup(request.getAgeGroup());
        event.setLocation(request.getLocation());
        event.setFee(request.getFee());
        event.setDetails(request.getDetails());

        eventRepository.save(event);
        return eventMapper.toDto(event);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'STAFF')")
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

        if (event.getAgeGroup() != AgeGroup.EVERYONE) {
            if (user.getAgeGroup() != event.getAgeGroup()) {
                throw new AgeGroupMismatchException("Your age group does not match this event.");
            }
        }

        if( event.getStatus() != EventStatus.NOT_STARTED) {
            throw new InvalidEventException("You can only register for events that have not started yet.");
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

    //Hủy đăng kí sự kiện
    @PreAuthorize("hasRole('MEMBER')")
    public void cancelEventRegistration(UUID eventId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        EventUserId id = new EventUserId(eventId, username);
        EventUser userEvent = eventUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("You are not registered for this event"));

        // Kiểm tra điều kiện 3 ngày trước khi sự kiện bắt đầu
        LocalDateTime now = LocalDateTime.now();

        if (event.getStatus() == EventStatus.CANCELLED || event.getEndDate().isBefore(now)) {
            throw new EventCancellationBlockedException("This event cannot be canceled.");
        }

        if (event.getStartDate().isBefore(now.plusDays(3))) {
            throw new CancellationNotAllowedException("You can only cancel at least 3 days before the event.");
        }

        // Đánh dấu đã huỷ
        userEvent.setStatus(EventUserStatus.NOT_REGISTERED);
        eventUserRepository.save(userEvent);
    }

    @PreAuthorize("hasAnyRole('MEMBER', 'STAFF', 'MANAGER')")
    //Lấy status của người đăng kí sự kiện
    public EventStatusResponse getEventStatus(UUID eventId, String username) {
        Optional<EventUser> eventUser = eventUserRepository.findById(new EventUserId(eventId, username));

        EventUserStatus status = eventUser
                .map(EventUser::getStatus)
                .map(eventUserStatus -> switch (eventUserStatus) {
                    case REGISTERED -> EventUserStatus.REGISTERED;
                    case NOT_REGISTERED  -> EventUserStatus.NOT_REGISTERED;
                    case CANCELLED -> EventUserStatus.CANCELLED;
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

    @PreAuthorize("hasRole('MEMBER') or !isAuthenticated()")
    public List<EventResponse> getEventsByAgeGroup(AgeGroup ageGroup) {
        // Kiểm tra nếu người dùng chưa đăng nhập, trả về các sự kiện dành cho tất cả mọi người (AgeGroup.EVERYONE)
        if (SecurityContextHolder.getContext().getAuthentication() == null ||
                !SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            // Người dùng chưa đăng nhập, chỉ lấy các sự kiện với AgeGroup = "EVERYONE"
            List<Event> events = eventRepository.findByAgeGroupInAndStatus(
                    List.of(AgeGroup.EVERYONE),
                    EventStatus.NOT_STARTED
            );
            return events.stream()
                    .map(eventMapper::toDto)
                    .collect(Collectors.toList());
        }

        // Nếu người dùng đã đăng nhập (MEMBER), có thể lấy các sự kiện cho nhóm tuổi của họ
        List<AgeGroup> groups = List.of(ageGroup, AgeGroup.EVERYONE);
        List<Event> events = eventRepository.findByAgeGroupInAndStatus(
                groups,
                EventStatus.NOT_STARTED
        );

        return events.stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }


    @PreAuthorize("hasRole('MEMBER')")
    public List<EventResponse> getEventsByMember(String memberId) {
        return eventUserRepository.findByMemberId(memberId).stream()
                .filter(eventUser -> eventUser.getStatus() == EventUserStatus.REGISTERED)
                .map(EventUser::getEventId)
                .map(eventRepository::findById)
                .flatMap(Optional::stream) // tự động bỏ qua Optional.empty()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByStatus(EventStatus status) {
        List<Event> events = eventRepository.findByStatusOrderByCreatedAtDesc(status);
        return events.stream()
                .map(event -> eventMapper.toDto(event))
                .toList();
    }

    ///MANAGER APPROVE REJECT EVENT
    @PreAuthorize("hasRole('MANAGER')")
    public EventResponse approveEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setStatus(EventStatus.APPROVED);
        Event savedEvent = eventRepository.save(event);

        // Giả sử bạn có eventMapper để convert entity → DTO
        return eventMapper.toDto(savedEvent);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public EventResponse rejectEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setStatus(EventStatus.REJECTED);
        Event savedEvent = eventRepository.save(event);

        // Giả sử bạn có eventMapper để convert entity → DTO
        return eventMapper.toDto(savedEvent);
    }
}
