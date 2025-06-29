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

        List<Instant> requestedAvailabilitiesTimes = request.getAvailabilityDateTimes();

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

        // They will be automatically linked to the consultant via the 'consultant' field
        List<Availability> savedAvailabilities = availabilityRepository.saveAll(newAvailabilitiesToPersist);

        // Update the consultant's list (JPA usually manages this, but explicitly setting ensures consistency)
        // This is crucial for the consultant.getConsultantAvailabilities() to return the updated list
        // within the same transaction and immediately after saving.
        consultant.getConsultantAvailabilities().addAll(savedAvailabilities);
        // Note: You don't need to call userRepository.save(consultant) explicitly here
        // because `Availability` is the owning side of the relationship (has @JoinColumn)
        // and we're operating within a @Transactional context. Saving the Availability entities
        // with the consultant reference is enough. If you were doing a cascade save, that would be different.

        return savedAvailabilities.stream().map(availabilityMapper::toDto).toList();
    }

    public List<LocalDateTime> getConsultantAvailableSlots(String username, LocalDate from, LocalDate to) {
        List<LocalDateTime> availableSlotsLocal = new ArrayList<>();
        // Chuyển đổi LocalDate sang Instant với múi giờ cụ thể
        Instant fromInstantUtc = from.atStartOfDay(VIETNAM_ZONE).toInstant();
        Instant toInstantUtc = to.atTime(LocalTime.MAX).atZone(VIETNAM_ZONE).toInstant();

        List<Availability> unavailableSlots = getByConsultantUsernameAndAvailabilityDateTimeBetween(username, fromInstantUtc, toInstantUtc);
        List<Availability> unavailableSlotsExceptForCancelled = new ArrayList<>();
        for (Availability slot : unavailableSlots) {
            if (!slot.getStatus().equals(AppointmentStatus.CANCELLED)) {
                unavailableSlotsExceptForCancelled.add(slot);
            }
        }

        // Chuyển đổi Instant AvailabilityDateTime từ kết quả truy vấn sang LocalDateTime
        List<LocalDateTime> bookedAvailabilitiesLocal = unavailableSlotsExceptForCancelled.stream()
                .map(availability -> LocalDateTime.ofInstant(availability.getAvailabilityDateTime(), VIETNAM_ZONE))
                .toList();

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            for (int hour = 8; hour <= 17; hour++) {
                if (hour == 12) {
                    continue;
                }

                LocalDateTime slotLocal = LocalDateTime.of(date, LocalTime.of(hour, 0));
                if (!bookedAvailabilitiesLocal.contains(slotLocal)) {
                    availableSlotsLocal.add(slotLocal);
                }
            }
        }
        return availableSlotsLocal;
    }

    public List<LocalDateTime> getConsultantScheduledSlots(String username, LocalDate from, LocalDate to) {
        // Chuyển đổi LocalDate sang Instant với múi giờ cụ thể
        Instant fromInstantUtc = from.atStartOfDay(VIETNAM_ZONE).toInstant();
        Instant toInstantUtc = to.atTime(LocalTime.MAX).atZone(VIETNAM_ZONE).toInstant();

        List<Availability> unavailableSlots = getByConsultantUsernameAndAvailabilityDateTimeBetween(username, fromInstantUtc, toInstantUtc);
        List<Availability> unavailableSlotsExceptForCancelled = new ArrayList<>();
        for (Availability slot : unavailableSlots) {
            if (!slot.getStatus().equals(AppointmentStatus.CANCELLED)) {
                unavailableSlotsExceptForCancelled.add(slot);
            }
        }

        // Chuyển đổi Instant AvailabilityDateTime từ kết quả truy vấn sang LocalDateTime
        return unavailableSlotsExceptForCancelled.stream()
                .map(availability -> LocalDateTime.ofInstant(availability.getAvailabilityDateTime(), VIETNAM_ZONE)).toList();
    }

    public List<Availability> getByConsultantUsernameAndAvailabilityDateTimeBetween(String username, Instant from, Instant to) {
        return availabilityRepository.findByConsultantUsernameAndAvailabilityDateTimeBetween(username, from, to);
    }

    public List<AvailabilityResponse> updateConsultantAvailabilities(UpdateAvailabilityRequest request) {
        String loginConsultant = userService.getLoginUsername();
        User consultant = userService.getUserEntity(loginConsultant);

        List<Instant> requestedAvailabilitiesTimes = request.getAvailabilityDateTimes();

        Set<Instant> existingTimesForThisConsultant = consultant.getConsultantAvailabilities().stream()
                .map(Availability::getAvailabilityDateTime)
                .collect(Collectors.toSet());

        List<Availability> newAvailabilitiesToPersist = new ArrayList<>();

        for (Instant time : requestedAvailabilitiesTimes) {
            if (existingTimesForThisConsultant.contains(time)) {
                AppointmentStatus status = request.getStatus();
                Availability availability = getConsultantAvailabilityByAvailabilityDateTime(loginConsultant, time);
                if (status.equals(AppointmentStatus.SCHEDULED)) {
                    availability.setStatus(AppointmentStatus.CANCELLED);
                } else if (status.equals(AppointmentStatus.CANCELLED)) {
                    availability.setStatus(AppointmentStatus.RESCHEDULED);
                } else if (status.equals(AppointmentStatus.RESCHEDULED)) {
                    availability.setStatus(AppointmentStatus.CANCELLED);
                } else {
                    throw new RuntimeException("This status does not exist in AppointmentStatus");
                }
            }
        }

        List<Availability> savedAvailabilities = availabilityRepository.saveAll(newAvailabilitiesToPersist);

        consultant.getConsultantAvailabilities().addAll(savedAvailabilities);

        return savedAvailabilities.stream().map(availabilityMapper::toDto).toList();
    }

    private Availability getConsultantAvailabilityByAvailabilityDateTime(String username, Instant time) {
        return availabilityRepository.findByConsultantUsernameAndAvailabilityDateTime(username, time);
    }
}
