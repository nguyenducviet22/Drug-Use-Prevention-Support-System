package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.MailBody;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AppointmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import com.swp.drug_use_prevention_support_system.domain.entities.Availability;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.AppointmentMapper;
import com.swp.drug_use_prevention_support_system.repositories.AppointmentRepository;
import com.swp.drug_use_prevention_support_system.repositories.AvailabilityRepository;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final UserService userService;
    private final GoogleCalendarService googleCalendarService;
    private final AvailabilityService availabilityService;
    private final AvailabilityRepository availabilityRepository;
    private final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final EmailService emailService;

    @PostAuthorize("returnObject.member.username == authentication.name")
    public AppointmentResponse createAppointment(CreateAppointmentRequest request) throws GeneralSecurityException, IOException {
        Appointment appointment = appointmentMapper.toEntity(request);
        String link = googleCalendarService.createGGMeetAppointment(request);
        appointment.setLink(link);
        Instant appointmentDateTime = Instant.parse(request.getAppointmentDateTime());
        appointment.setAppointmentDateTime(appointmentDateTime);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        String loginUsername = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(loginUsername);
        appointment.setMember(loginUser);
        String consultantUsername = request.getConsultantID();
        User consultant = userService.getUserEntity(consultantUsername);
        appointment.setConsultant(consultant);
        appointmentRepository.save(appointment);
        availabilityService.confirmConsultantScheduledSlots(consultantUsername, appointmentDateTime, AppointmentStatus.CONFIRMED);
        return appointmentMapper.toDto(appointment);
    }

    public List<AppointmentResponse> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream().map(appointmentMapper::toDto).toList();
    }

    public List<AppointmentResponse> getMemberAppointments(String username) {
        List<Appointment> appointments = appointmentRepository.findByMemberUsernameOrderByAppointmentDateTimeAsc(username);
        return appointments.stream().map(appointmentMapper::toDto).toList();
    }

    public List<AppointmentResponse> getConsultantAppointments(String username) {
        List<Appointment> appointments = appointmentRepository.findByConsultantUsernameOrderByAppointmentDateTimeAsc(username);
        return appointments.stream().map(appointmentMapper::toDto).toList();
    }

    public Appointment getAppointmentEntity(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment does not exist with ID :" + id));
    }

    public AppointmentResponse getAppointment(UUID id) {
        Appointment appointment = getAppointmentEntity(id);
        return appointmentMapper.toDto(appointment);
    }

    public AppointmentResponse updateAppointment(UUID id, UpdateAppointmentRequest request) {
        Appointment appointment = getAppointmentEntity(id);
        appointment.setAppointmentDateTime(Instant.parse(request.getAppointmentDateTime()));
        appointment.setNotes(request.getNotes());
        appointment.setStatus(request.getStatus());
        appointmentRepository.save(appointment);
        return appointmentMapper.toDto(appointment);
    }

    public List<AppointmentResponse> getMemberTodayAppointments(String username) {
        ZoneId zone = ZoneId.systemDefault();
        Instant startOfDay = LocalDate.now().atStartOfDay(zone).toInstant();
        Instant endOfDay = LocalDate.now().plusDays(1).atStartOfDay(zone).toInstant();
        List<Appointment> appointments = appointmentRepository
                .findByMemberUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(username, startOfDay, endOfDay);
        return appointments.stream().map(appointmentMapper::toDto).toList();
    }

    public List<AppointmentResponse> getConsultantTodayAppointments(String username) {
        ZoneId zone = ZoneId.systemDefault();
        Instant startOfDay = LocalDate.now().atStartOfDay(zone).toInstant();
        Instant endOfDay = LocalDate.now().plusDays(1).atStartOfDay(zone).toInstant();
        List<Appointment> appointments = appointmentRepository
                .findByConsultantUsernameAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(username, startOfDay, endOfDay);
        return appointments.stream().map(appointmentMapper::toDto).toList();
    }

    public List<AppointmentResponse> getAllAppointmentsByDateDuration(Instant startedAt, Instant endedAt) {
        List<Appointment> appointments = appointmentRepository.findByCreatedAtBetween(startedAt, endedAt);
        return appointments.stream().map(appointmentMapper::toDto).toList();
    }

    public long countConsultantAppointments(String username) {
        return appointmentRepository.countByConsultantUsername(username);
    }

    public long countTotalMembersOfConsultant(String username) {
        return appointmentRepository.countDistinctMembersByConsultantUsername(username);
    }

    private List<Appointment> getByMemberUsernameAndAppointmentDateTimeBetween(String username,
                                                                               Instant from,
                                                                               Instant to) {
        return appointmentRepository.findByMemberUsernameAndAppointmentDateTimeBetween(username, from, to);
    }

    public List<LocalDateTime> getMemberBookedAppointmentByStatus(String username,
                                                                  String fromDateString,
                                                                  String toDateString,
                                                                  AppointmentStatus status) {
        // Parse the input strings as LocalDate first
        LocalDate fromLocalDate = LocalDate.parse(fromDateString);
        LocalDate toLocalDate = LocalDate.parse(toDateString);

        // Convert LocalDate to Instant for the database query range
        Instant fromInstant = fromLocalDate.atStartOfDay(VIETNAM_ZONE).toInstant();
        Instant toInstant = toLocalDate.atTime(LocalTime.MAX).atZone(VIETNAM_ZONE).toInstant();

        List<Appointment> scheduledSlots = getByMemberUsernameAndAppointmentDateTimeBetween(username, fromInstant, toInstant);

        return scheduledSlots.stream()
                .filter(appointment -> appointment.getStatus().equals(status))
                .map(appointment -> LocalDateTime.ofInstant(appointment.getAppointmentDateTime(), VIETNAM_ZONE))
                .toList();
    }

    @Transactional
    public AppointmentResponse cancelMemberScheduledAppointment(AppointmentStatus status,
                                                                UpdateAppointmentRequest request) throws MessagingException {
        String loginUsername = userService.getLoginUsername();
        Instant slotToCancel = Instant.parse(request.getAppointmentDateTime());

        Appointment appointment = getMemberAppointmentEntityByAppointmentDateTime(loginUsername, slotToCancel);
        if (appointment != null) {
            if (status.equals(AppointmentStatus.CANCELLED)) {
                appointment.setStatus(AppointmentStatus.CANCELLED);
                String reason = request.getNotes();
                appointment.setNotes(reason);
                appointmentRepository.save(appointment);
                Availability availability = availabilityService.getConsultantAvailabilityEntityByAvailabilityDateTime(appointment.getConsultant().getUsername(), slotToCancel);
                if (availability != null) {
                    availability.setStatus(AppointmentStatus.CANCELLED);
                    availabilityRepository.save(availability);

                    // Notify the member and the consultant
                    User member = appointment.getMember();
                    String memberEmail = member.getEmail();
                    User consultant = appointment.getConsultant();
                    String consultantEmail = consultant.getEmail();
                    String[] recipients = {memberEmail, consultantEmail};
                    MailBody mailBody = MailBody.builder()
                            .to(recipients)
                            .subject("Appointment Canceled by Member")
                            .content(reason)
                            .build();
                    emailService.sendEmail(mailBody);
                }
                return appointmentMapper.toDto(appointment);
            } else {
                throw new RuntimeException("This status does not exist in AppointmentStatus");
            }
        } else {
            throw new EntityNotFoundException("This appointment does not exist to cancel");
        }
    }

    private Appointment getMemberAppointmentEntityByAppointmentDateTime(String username, Instant time) {
        return appointmentRepository.findByMemberUsernameAndAppointmentDateTime(username, time);
    }

    ////ADMIN HOMEPAGE
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAppointmentStats() {
        Map<String, Object> stats = new HashMap<>();

        YearMonth current = YearMonth.now();
        YearMonth last = current.minusMonths(1);

        int thisMonthCount = appointmentRepository.countAppointmentsByMonth(current.getYear(), current.getMonthValue());
        int lastMonthCount = appointmentRepository.countAppointmentsByMonth(last.getYear(), last.getMonthValue());

        int growth = thisMonthCount - lastMonthCount;
        double growthPercent = lastMonthCount > 0 ? (double) growth / lastMonthCount * 100 : 0;

        stats.put("totalAppointments", thisMonthCount);
        stats.put("growthPercent", Math.round(growthPercent));

        return stats;
    }
}