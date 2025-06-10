package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.entities.*;
import com.swp.drug_use_prevention_support_system.domain.enums.*;
import com.swp.drug_use_prevention_support_system.repositories.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserDetailsRepository userDetailsRepository;
    private final QualificationRepository qualificationRepository;
    private final AssessmentRepository assessmentRepository;
    private final CourseRepository courseRepository;
    private final BlogRepository blogRepository;
    private final EventRepository eventRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public void importUsersFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Users");
        List<User> users = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String username = getCellValue(row.getCell(0));
                String password = getCellValue(row.getCell(1));
                String email = getCellValue(row.getCell(2));
                String fullName = getCellValue(row.getCell(3));
                LocalDate dob = LocalDate.parse(getCellValue(row.getCell(4)));
                Gender gender = Gender.valueOf(getCellValue(row.getCell(5)).toUpperCase());
                String phone = getCellValue(row.getCell(6));
                String job = getCellValue(row.getCell(7));
                Role role = Role.valueOf(getCellValue(row.getCell(8)).toUpperCase());
                String address = getCellValue(row.getCell(9));
                UserStatus status = UserStatus.valueOf(getCellValue(row.getCell(10)).toUpperCase());

                User user = User.builder()
                        .username(username)
                        .password(password)
                        .email(email)
                        .fullName(fullName)
                        .dob(dob)
                        .gender(gender)
                        .phoneNumber(phone)
                        .job(job)
                        .address(address)
                        .role(role)
                        .status(status)
                        .build();
                users.add(user);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Users at line" + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        userRepository.saveAll(users);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importUserDetailsFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("UserDetails");
        List<UserDetails> userDetailsList = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String fullName = getCellValue(row.getCell(0));
                String phoneNumber = getCellValue(row.getCell(1));
                String relationship = getCellValue(row.getCell(2));
                String address = getCellValue(row.getCell(3));
                UserStatus status = UserStatus.valueOf(getCellValue(row.getCell(4)).toUpperCase());
                String memberUsername = getCellValue(row.getCell(5));
                User member = userService.getUserEntity(memberUsername);

                UserDetails userDetails = UserDetails.builder()
                        .fullName(fullName)
                        .phoneNumber(phoneNumber)
                        .relationship(relationship)
                        .address(address)
                        .status(status)
                        .member(member)
                        .build();
                userDetailsList.add(userDetails);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import User Details at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        userDetailsRepository.saveAll(userDetailsList);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importQualificationsFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Qualifications");
        List<Qualification> qualifications = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String img = getCellValue(row.getCell(0));
                Degree degree = Degree.valueOf(getCellValue(row.getCell(1)));
                String institution = getCellValue(row.getCell(2));
                Integer year = Integer.valueOf(getCellValue(row.getCell(3)));
                String description = getCellValue(row.getCell(4));
                CourseStatus status = CourseStatus.valueOf(getCellValue(row.getCell(5)).toUpperCase());
                String consultantUsername = getCellValue(row.getCell(6));
                User consultant = userService.getUserEntity(consultantUsername);

                Qualification qualification = Qualification.builder()
                        .img(img)
                        .degree(degree)
                        .institution(institution)
                        .year(year)
                        .description(description)
                        .status(status)
                        .consultant(consultant)
                        .build();
                qualifications.add(qualification);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Qualifications at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        qualificationRepository.saveAll(qualifications);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importBlogsFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Blogs");
        List<Blog> blogs = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String name = getCellValue(row.getCell(0));
                Integer rate = Integer.valueOf(getCellValue(row.getCell(1)));
                String img = getCellValue(row.getCell(2));
                String description = getCellValue(row.getCell(3));
                BlogType type = BlogType.valueOf(getCellValue(row.getCell(4)).toUpperCase());
                BlogStatus status = BlogStatus.valueOf(getCellValue(row.getCell(5)).toUpperCase());
                String memberUsername = getCellValue(row.getCell(6));
                User member = userService.getUserEntity(memberUsername);

                Blog blog = Blog.builder()
                        .blogName(name)
                        .rate(rate)
                        .img(img)
                        .description(description)
                        .blogType(type)
                        .blogStatus(status)
                        .member(member)
                        .build();
                blogs.add(blog);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Blogs at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        blogRepository.saveAll(blogs);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importCoursesFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Courses");
        List<Course> courses = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String name = getCellValue(row.getCell(0));
                Integer quantity = Integer.valueOf(getCellValue(row.getCell(1)));
                Integer duration = Integer.valueOf(getCellValue(row.getCell(2)));
                String img = getCellValue(row.getCell(3));
                String description = getCellValue(row.getCell(4));
                AgeGroup ageGroup = AgeGroup.valueOf(getCellValue(row.getCell(5)).toUpperCase());
                CourseStatus status = CourseStatus.valueOf(getCellValue(row.getCell(6)).toUpperCase());

                Course course = Course.builder()
                        .courseName(name)
                        .quantity(quantity)
                        .duration(duration)
                        .img(img)
                        .description(description)
                        .ageGroup(ageGroup)
                        .status(status)
                        .build();
                courses.add(course);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Courses at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        courseRepository.saveAll(courses);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importAssessmentsFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Assessments");
        List<Assessment> assessments = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String img = getCellValue(row.getCell(0));
                RiskLevel riskLevel = RiskLevel.valueOf(getCellValue(row.getCell(1)).toUpperCase());
                Integer score = Integer.valueOf(getCellValue(row.getCell(2)));
                String type = getCellValue(row.getCell(3));
                String suggestedAction = getCellValue(row.getCell(4));
                String username = getCellValue(row.getCell(5));
                User user = userService.getUserEntity(username);

                Assessment assessment = Assessment.builder()
                        .img(img)
                        .riskLevel(riskLevel)
                        .score(score)
                        .assessmentType(type)
                        .suggestedAction(suggestedAction)
                        .user(user)
                        .build();
                assessments.add(assessment);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Courses at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        assessmentRepository.saveAll(assessments);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importEventsFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Events");
        List<Event> events = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String name = getCellValue(row.getCell(0));
                Integer duration = Integer.valueOf(getCellValue(row.getCell(1)));
                Integer quantity = Integer.valueOf(getCellValue(row.getCell(2)));
                String description = getCellValue(row.getCell(3));
                String img = getCellValue(row.getCell(4));
                EventStatus status = EventStatus.valueOf(getCellValue(row.getCell(5)).toUpperCase());
                LocalDate startDate = LocalDate.parse(getCellValue(row.getCell(6)));
                LocalDate endDate = LocalDate.parse(getCellValue(row.getCell(7)));

                Event event = Event.builder()
                        .eventName(name)
                        .duration(duration)
                        .quantity(quantity)
                        .description(description)
                        .img(img)
                        .status(status)
                        .startDate(startDate)
                        .endDate(endDate)
                        .build();
                events.add(event);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Events at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        eventRepository.saveAll(events);
        workbook.close();
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    private boolean isRowEmpty(Row row) {
        for (int c = 0; c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }


}
