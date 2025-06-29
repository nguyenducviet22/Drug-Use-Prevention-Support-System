package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.ReportRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ReportResponse;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.CourseStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.ZonedDateTime;
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
        LocalDate reportStartDate;
        LocalDate reportEndDate;

        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();

        // Bước 1: Xác định khoảng thời gian tổng thể của báo cáo
        String filterType = request.getFilterType().toUpperCase();

        if ("CUSTOM".equals(filterType)) {
            // Xử lý bộ lọc tùy chỉnh
            if (request.getStartDate() == null || request.getEndDate() == null) {
                // Trả về danh sách rỗng nếu không có ngày
                return new ArrayList<>();
            }
            // Chuyển đổi chuỗi ISO sang LocalDate
            reportStartDate = ZonedDateTime.parse(request.getStartDate()).toLocalDate();
            reportEndDate = ZonedDateTime.parse(request.getEndDate()).toLocalDate();
        } else {
            switch (filterType) {
                case "Q1":
                    reportStartDate = LocalDate.of(currentYear, Month.JANUARY, 1);
                    reportEndDate = LocalDate.of(currentYear, Month.MARCH, 31);
                    break;
                case "Q2":
                    reportStartDate = LocalDate.of(currentYear, Month.APRIL, 1);
                    reportEndDate = LocalDate.of(currentYear, Month.JUNE, 30);
                    break;
                case "Q3":
                    reportStartDate = LocalDate.of(currentYear, Month.JULY, 1);
                    reportEndDate = LocalDate.of(currentYear, Month.SEPTEMBER, 30);
                    break;
                case "Q4":
                    reportStartDate = LocalDate.of(currentYear, Month.OCTOBER, 1);
                    reportEndDate = LocalDate.of(currentYear, Month.DECEMBER, 31);
                    break;
                case "FIRST_HALF":
                    reportStartDate = LocalDate.of(currentYear, Month.JANUARY, 1);
                    reportEndDate = LocalDate.of(currentYear, Month.JUNE, 30);
                    break;
                case "LAST_HALF":
                    reportStartDate = LocalDate.of(currentYear, Month.JULY, 1);
                    reportEndDate = LocalDate.of(currentYear, Month.DECEMBER, 31);
                    break;
                case "THIS_YEAR":
                    reportStartDate = LocalDate.of(currentYear, 1, 1);
                    reportEndDate = LocalDate.of(currentYear, 12, 31);
                    break;
                case "ALL":
                default:
                    reportStartDate = LocalDate.of(2024, 1, 1);
                    reportEndDate = now;
                    break;
            }
        }

        // Bước 2: Lặp qua từng tháng trong khoảng thời gian đã xác định
        List<ReportResponse> reportData = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yy");
        YearMonth startMonth = YearMonth.from(reportStartDate);
        YearMonth endMonth = YearMonth.from(reportEndDate);

        for (YearMonth currentMonth = startMonth; !currentMonth.isAfter(endMonth); currentMonth = currentMonth.plusMonths(1)) {
            LocalDate monthStart = currentMonth.atDay(1);
            LocalDate monthEnd = currentMonth.atEndOfMonth();

            // Bước 3: Tính toán số liệu cho từng tháng
            ReportResponse dataPoint = new ReportResponse();
            dataPoint.setDate(monthStart); // Dùng ngày đầu tháng làm đại diện
            dataPoint.setMonth(monthStart.format(monthFormatter));

            dataPoint.setTotalMembers(userService.getAllUsersByDateDuration(monthStart, monthEnd).size());
            dataPoint.setStaffMembers(userService.getUsersByRoleAndDateDuration(Role.STAFF, monthStart, monthEnd).size());
            dataPoint.setConsultants(userService.getUsersByRoleAndDateDuration(Role.CONSULTANT, monthStart, monthEnd).size());
            dataPoint.setMonthlyConsultations(appointmentService.getAllAppointmentsByDateDuration(monthStart, monthEnd).size());
            dataPoint.setActiveCourses(courseService.getCoursesByStatusAndDateDuration(CourseStatus.AVAILABLE, monthStart, monthEnd).size());
            dataPoint.setBlogs(blogService.getBlogsByStatusAndDateDuration(BlogStatus.PUBLISHED, monthStart, monthEnd).size());
            dataPoint.setEvents(0);
            dataPoint.setCourses(courseService.getAllCoursesByDateDuration(monthStart, monthEnd).size());

            reportData.add(dataPoint);
        }
        return reportData;
    }

    public ReportResponse getStatCardData() {
        ReportResponse statCardData = new ReportResponse();
        statCardData.setTotalMembers(userService.getUsersByStatus(UserStatus.ACTIVE).size());
        statCardData.setStaffMembers(userService.getUsersByStatusAndRole(UserStatus.ACTIVE, Role.STAFF).size());
        statCardData.setConsultants(userService.getUsersByStatusAndRole(UserStatus.ACTIVE, Role.CONSULTANT).size());
        statCardData.setMonthlyConsultations(appointmentService.getAllAppointmentsByDateDuration(LocalDate.now().withDayOfMonth(1), LocalDate.now()).size());
        statCardData.setActiveCourses(courseService.getCoursesByStatus(CourseStatus.AVAILABLE).size());
        statCardData.setBlogs(blogService.getBlogsByStatus(BlogStatus.PUBLISHED).size());
        statCardData.setCourses(courseService.getCoursesByStatus(CourseStatus.AVAILABLE).size());
        statCardData.setEvents(0);
        return statCardData;
    }
}
