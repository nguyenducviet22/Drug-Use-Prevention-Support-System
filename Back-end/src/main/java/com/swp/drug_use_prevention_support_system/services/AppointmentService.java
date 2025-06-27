package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateAppointmentRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AppointmentResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Appointment;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AppointmentStatus;
import com.swp.drug_use_prevention_support_system.mappers.AppointmentMapper;
import com.swp.drug_use_prevention_support_system.repositories.AppointmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.stereotype.Service;

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
    private final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @PostAuthorize("returnObject.member.username == authentication.name")
    public AppointmentResponse createAppointment(CreateAppointmentRequest request) throws GeneralSecurityException, IOException {
        // Chuyển đổi Instant (UTC) sang giờ địa phương Việt Nam để lưu hoặc xử lý
        Instant utcTime = request.getAppointmentDateTime();

        Appointment appointment = appointmentMapper.toEntity(request);
        String link = googleCalendarService.createGGMeetAppointment(request);
        appointment.setLink(link);
        appointment.setAppointmentDateTime(utcTime);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        String loginUsername = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(loginUsername);
        appointment.setMember(loginUser);
        User consultant = userService.getUserEntity(request.getConsultantID());
        appointment.setConsultant(consultant);
        appointmentRepository.save(appointment);
        return appointmentMapper.toDto(appointment);
    }

    public List<AppointmentResponse> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream().map(appointmentMapper::toDto).toList();
    }

    public List<AppointmentResponse> getMemberAppointments(String username) {
        List<Appointment> appointments = appointmentRepository.findByMemberUsername(username);
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
        // Chuyển đổi Instant (UTC) sang giờ địa phương Việt Nam để lưu hoặc xử lý
        Instant utcTime = request.getAppointmentDateTime();

        Appointment appointment = getAppointmentEntity(id);
        appointment.setAppointmentDateTime(utcTime);
        appointment.setNotes(request.getNotes());
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment.setStatus(request.getStatus());
        User consultant = userService.getUserEntity(request.getConsultantID());
        appointment.setConsultant(consultant);
        appointmentRepository.save(appointment);
        return appointmentMapper.toDto(appointment);
    }

    public AppointmentResponse getMyTodayAppointment(String username) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        Appointment appointment = appointmentRepository
                .findByMemberUsernameAndAppointmentDateTimeBetween(username, startOfDay, endOfDay);
        return appointmentMapper.toDto(appointment);
    }
}