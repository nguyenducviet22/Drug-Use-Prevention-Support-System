package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.entities.Event;
import com.swp.drug_use_prevention_support_system.domain.enums.EventStatus;
import com.swp.drug_use_prevention_support_system.repositories.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventSchedulerService {

    private final EventRepository eventRepository;

    @Scheduled(fixedRate = 5 * 60 * 1000) // Mỗi 5 phút
    public void updateEventStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> updatedEvents = new ArrayList<>();

        // Lấy các event NOT_STARTED → kiểm tra nếu đã đến thời gian bắt đầu
        List<Event> notStartedEvents = eventRepository.findByStatus(EventStatus.NOT_STARTED);
        for (Event event : notStartedEvents) {
            if (!event.getStartDate().isAfter(now)) {
                event.setStatus(EventStatus.ONGOING);
                updatedEvents.add(event);
            }
        }

        // Lấy các event ONGOING → kiểm tra nếu đã hết hạn
        List<Event> ongoingEvents = eventRepository.findByStatus(EventStatus.ONGOING);
        for (Event event : ongoingEvents) {
            if (!event.getEndDate().isAfter(now)) {
                event.setStatus(EventStatus.EXPIRED);
                updatedEvents.add(event);
            }
        }

        // Cập nhật các sự kiện đã thay đổi trạng thái
        eventRepository.saveAll(updatedEvents);
    }
}