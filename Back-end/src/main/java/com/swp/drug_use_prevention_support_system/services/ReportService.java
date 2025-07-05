package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.ReportRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ReportResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BlogService blogService;
    private final CourseService courseService;
    private final UserService userService;
    private final AppointmentService appointmentService;

    public List<ReportResponse> getLineChartData(ReportRequest request) {
        LocalDate reportStartedAtLocal;
        LocalDate reportEndedAtLocal;

        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();

        String filterType = request.getFilterType().toUpperCase();

        if ("CUSTOM".equals(filterType)) {
            if (request.getStartedMonth() == null || request.getEndedMonth() == null) {
                return new ArrayList<>();
            }
            // Chuyển đổi chuỗi ISO sang LocalDate
            reportStartedAtLocal = ZonedDateTime.parse(request.getStartedMonth()).toLocalDate();
            reportEndedAtLocal = ZonedDateTime.parse(request.getEndedMonth()).toLocalDate();
        } else {
            switch (filterType) {
                case "Q1":
                    reportStartedAtLocal = LocalDate.of(currentYear, Month.JANUARY, 1);
                    reportEndedAtLocal = LocalDate.of(currentYear, Month.MARCH, 31);
                    break;
                case "Q2":
                    reportStartedAtLocal = LocalDate.of(currentYear, Month.APRIL, 1);
                    reportEndedAtLocal = LocalDate.of(currentYear, Month.JUNE, 30);
                    break;
                case "Q3":
                    reportStartedAtLocal = LocalDate.of(currentYear, Month.JULY, 1);
                    reportEndedAtLocal = LocalDate.of(currentYear, Month.SEPTEMBER, 30);
                    break;
                case "Q4":
                    reportStartedAtLocal = LocalDate.of(currentYear, Month.OCTOBER, 1);
                    reportEndedAtLocal = LocalDate.of(currentYear, Month.DECEMBER, 31);
                    break;
                case "FIRST_HALF":
                    reportStartedAtLocal = LocalDate.of(currentYear, Month.JANUARY, 1);
                    reportEndedAtLocal = LocalDate.of(currentYear, Month.JUNE, 30);
                    break;
                case "LAST_HALF":
                    reportStartedAtLocal = LocalDate.of(currentYear, Month.JULY, 1);
                    reportEndedAtLocal = LocalDate.of(currentYear, Month.DECEMBER, 31);
                    break;
                case "THIS_YEAR":
                    reportStartedAtLocal = LocalDate.of(currentYear, 1, 1);
                    reportEndedAtLocal = LocalDate.of(currentYear, 12, 31);
                    break;
                case "ALL":
                default:
                    reportStartedAtLocal = LocalDate.of(2024, 1, 1);
                    reportEndedAtLocal = now;
                    break;
            }
        }

        // Lặp qua từng tháng trong khoảng thời gian đã xác định
        List<ReportResponse> reportData = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy"); // Added year for clarity
        YearMonth startMonth = YearMonth.from(reportStartedAtLocal);
        YearMonth endMonth = YearMonth.from(reportEndedAtLocal);

        ZoneId appZone = ZoneId.systemDefault();

        for (YearMonth currentMonth = startMonth; !currentMonth.isAfter(endMonth); currentMonth = currentMonth.plusMonths(1)) {
            LocalDate monthStartLocal = currentMonth.atDay(1);
            LocalDate monthEndLocal = currentMonth.atEndOfMonth();

            Instant monthStartInstant = monthStartLocal.atStartOfDay(appZone).toInstant();
            Instant monthEndInstant = monthEndLocal.atTime(LocalTime.MAX).atZone(appZone).toInstant();

            ReportResponse dataPoint = new ReportResponse();
            dataPoint.setDate(monthStartLocal); // Still use LocalDate for response if preferred for display
            dataPoint.setMonth(monthStartLocal.format(monthFormatter));

            dataPoint.setTotalMembers(userService.getAllUsersByDateDuration(monthStartInstant, monthEndInstant).size());
            dataPoint.setStaffMembers(userService.getUsersByRoleAndDateDuration(Role.STAFF, monthStartInstant, monthEndInstant).size());
            dataPoint.setConsultants(userService.getUsersByRoleAndDateDuration(Role.CONSULTANT, monthStartInstant, monthEndInstant).size());
            dataPoint.setMonthlyConsultations(appointmentService.getAllAppointmentsByDateDuration(monthStartInstant, monthEndInstant).size());
            dataPoint.setActiveCourses(courseService.getCoursesByStatusAndDateDuration(CourseStatus.AVAILABLE, monthStartInstant, monthEndInstant).size());
            dataPoint.setBlogs(blogService.getBlogsByStatusAndDateDuration(BlogStatus.PUBLISHED, monthStartInstant, monthEndInstant).size());
            dataPoint.setEvents(0);
            dataPoint.setCourses(courseService.getAllCoursesByDateDuration(monthStartInstant, monthEndInstant).size());

            reportData.add(dataPoint);
        }
        return reportData;
    }

    public ReportResponse getStatCardData() {
        ReportResponse statCardData = new ReportResponse();

        ZoneId appZone = ZoneId.systemDefault();
        LocalDate now = LocalDate.now();
        Instant startOfMonthInstant = now.withDayOfMonth(1).atStartOfDay(appZone).toInstant();
        Instant currentMomentInstant = Instant.now();
        Instant endOfTodayInstant = now.atTime(LocalTime.MAX).atZone(appZone).toInstant();

        statCardData.setTotalMembers(userService.getUsersByStatus(UserStatus.ACTIVE).size());
        statCardData.setStaffMembers(userService.getUsersByStatusAndRole(UserStatus.ACTIVE, Role.STAFF).size());
        statCardData.setConsultants(userService.getUsersByStatusAndRole(UserStatus.ACTIVE, Role.CONSULTANT).size());
        statCardData.setMonthlyConsultations(appointmentService.getAllAppointmentsByDateDuration(startOfMonthInstant, endOfTodayInstant).size());
        statCardData.setActiveCourses(courseService.getCoursesByStatus(CourseStatus.AVAILABLE).size());
        statCardData.setBlogs(blogService.getBlogsByStatus(BlogStatus.PUBLISHED).size());
        statCardData.setCourses(courseService.getCoursesByStatus(CourseStatus.AVAILABLE).size());
        statCardData.setEvents(0);
        return statCardData;
    }
}