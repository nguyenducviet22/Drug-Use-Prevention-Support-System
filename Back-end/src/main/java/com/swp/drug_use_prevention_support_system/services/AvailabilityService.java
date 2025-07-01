package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAvailabilityRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AvailabilityResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Availability;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.AvailabilityMapper;
import com.swp.drug_use_prevention_support_system.repositories.AvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityMapper availabilityMapper;
    private final UserService userService;
    private final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Transactional
    public List<AvailabilityResponse> createConsultantAvailabilities(CreateAvailabilityRequest request) {
        String loginConsultant = userService.getLoginUsername();
        User consultant = userService.getUserEntity(loginConsultant);

        List<String> requestedAvailabilitiesTimesString = request.getAvailabilityDateTimes();
        List<Instant> requestedAvailabilitiesTimes = requestedAvailabilitiesTimesString.stream()
                .map(Instant::parse)
                .toList();

        Set<Instant> existingTimesForThisConsultant = consultant.getConsultantAvailabilities().stream()
                .map(Availability::getAvailabilityDateTime)
                .collect(Collectors.toSet());

        List<Availability> newAvailabilitiesToPersist = new ArrayList<>();

        for (Instant time : requestedAvailabilitiesTimes) {
            if (existingTimesForThisConsultant.contains(time)) {
                System.out.println("Availability at " + time + " already exists for consultant " + loginConsultant + ". Skipping.");
                continue;
            }

            Availability newAvailability = Availability.builder()
                    .availabilityDateTime(time)
                    .status(AppointmentStatus.SCHEDULED)
                    .consultant(consultant)
                    .build();
            newAvailabilitiesToPersist.add(newAvailability);
        }

        List<Availability> savedAvailabilities = availabilityRepository.saveAll(newAvailabilitiesToPersist);
        consultant.getConsultantAvailabilities().addAll(savedAvailabilities);
        return savedAvailabilities.stream().map(availabilityMapper::toDto).toList();
    }

    public List<LocalDateTime> getConsultantSlotsByStatus(String username, String fromDateString, String toDateString, AppointmentStatus status) {
        // Parse the input strings as LocalDate first
        LocalDate fromLocalDate = LocalDate.parse(fromDateString);
        LocalDate toLocalDate = LocalDate.parse(toDateString);

        // Convert LocalDate to Instant for the database query range
        Instant fromInstant = fromLocalDate.atStartOfDay(VIETNAM_ZONE).toInstant();
        Instant toInstant = toLocalDate.atTime(LocalTime.MAX).atZone(VIETNAM_ZONE).toInstant();

        List<Availability> scheduledSlots = getByConsultantUsernameAndAvailabilityDateTimeBetween(username, fromInstant, toInstant);

        return scheduledSlots.stream()
                .filter(slot -> slot.getStatus().equals(status))
                .map(slot -> LocalDateTime.ofInstant(slot.getAvailabilityDateTime(), VIETNAM_ZONE))
                .toList();
    }

    public List<LocalDateTime> getConsultantAvailableSlots(String username, String fromDateString, String toDateString) {
        // Parse the input strings as LocalDate first
        LocalDate fromLocalDate = LocalDate.parse(fromDateString);
        LocalDate toLocalDate = LocalDate.parse(toDateString);

        // Convert LocalDate to Instant for the database query range
        Instant fromInstant = fromLocalDate.atStartOfDay(VIETNAM_ZONE).toInstant();
        Instant toInstant = toLocalDate.atTime(LocalTime.MAX).atZone(VIETNAM_ZONE).toInstant();

        List<Availability> unavailableSlots = getByConsultantUsernameAndAvailabilityDateTimeBetween(username, fromInstant, toInstant);

        Set<Instant> unavailableInstantTimes = unavailableSlots.stream()
                .filter(slot -> !slot.getStatus().equals(AppointmentStatus.CANCELLED))
                .map(Availability::getAvailabilityDateTime)
                .collect(Collectors.toSet());

        List<LocalDateTime> availableSlotsLocal = new ArrayList<>();

        // Iterate through each day in the range (using parsed LocalDate values)
        for (LocalDate date = fromLocalDate; !date.isAfter(toLocalDate); date = date.plusDays(1)) {
            // Iterate through working hours for each day
            for (int hour = 8; hour <= 17; hour++) {
                // Skip lunch break
                if (hour == 12) {
                    continue;
                }

                LocalDateTime slotLocal = LocalDateTime.of(date, LocalTime.of(hour, 0));
                // Convert this LocalDateTime slot back to Instant for comparison with unavailableInstantTimes
                Instant potentialSlotInstant = slotLocal.atZone(VIETNAM_ZONE).toInstant();

                // Check if this potential slot is NOT in the set of unavailable instant times
                if (!unavailableInstantTimes.contains(potentialSlotInstant)) {
                    // Also, ensure the slot is not in the past relative to the current time (now)
                    // This is good practice for "available" slots
                    if (potentialSlotInstant.isAfter(Instant.now())) { // Added condition
                        availableSlotsLocal.add(slotLocal);
                    }
                }
            }
        }
        return availableSlotsLocal;
    }


    public List<Availability> getByConsultantUsernameAndAvailabilityDateTimeBetween(String username, Instant from, Instant to) {
        return availabilityRepository.findByConsultantUsernameAndAvailabilityDateTimeBetween(username, from, to);
    }

    private Availability getConsultantAvailabilityByAvailabilityDateTime(String username, Instant time) {
        return availabilityRepository.findByConsultantUsernameAndAvailabilityDateTime(username, time);
    }

    public List<AvailabilityResponse> cancelConsultantScheduledSlots(AppointmentStatus status, UpdateAvailabilityRequest request) {
        String loginConsultant = userService.getLoginUsername();
        User consultant = userService.getUserEntity(loginConsultant);

        Instant updatedSlot = Instant.parse(request.getUpdatedDateTime());

        LocalDate fromLocalDate = LocalDate.parse(request.getFrom());
        LocalDate toLocalDate = LocalDate.parse(request.getTo());
        Instant fromInstantForQuery = fromLocalDate.atStartOfDay(VIETNAM_ZONE).toInstant();
        Instant toInstantForQuery = toLocalDate.atTime(LocalTime.MAX).atZone(VIETNAM_ZONE).toInstant();
        List<Availability> existingAvailabilities = getByConsultantUsernameAndAvailabilityDateTimeBetween(
                loginConsultant, fromInstantForQuery, toInstantForQuery
        );
        List<Instant> existingTimesForThisConsultant = existingAvailabilities.stream()
                .map(Availability::getAvailabilityDateTime) // Extract the Instant from each Availability object
                .toList();

        List<Availability> newAvailabilitiesToPersist = new ArrayList<>();

        if (existingTimesForThisConsultant.contains(updatedSlot)) {
            Availability availability = getConsultantAvailabilityByAvailabilityDateTime(loginConsultant, updatedSlot);
            if (status.equals(AppointmentStatus.CANCELLED)) {
                availability.setStatus(AppointmentStatus.CANCELLED);
                availability.setReason(request.getReason());
            } else {
                throw new RuntimeException("This status does not exist in AppointmentStatus");
            }
        }

        List<Availability> savedAvailabilities = availabilityRepository.saveAll(newAvailabilitiesToPersist);
        consultant.getConsultantAvailabilities().addAll(savedAvailabilities);
        return savedAvailabilities.stream().map(availabilityMapper::toDto).toList();
    }
}
