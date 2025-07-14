package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.entities.*;
import com.swp.drug_use_prevention_support_system.domain.enums.*;
import com.swp.drug_use_prevention_support_system.domain.entities.Lesson;
import com.swp.drug_use_prevention_support_system.domain.entities.Module;
import com.swp.drug_use_prevention_support_system.repositories.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserDetailsRepository userDetailsRepository;
    private final QualificationRepository qualificationRepository;
    private final AssessmentRepository assessmentRepository;
    private final CourseRepository courseRepository;
    private final CourseService courseService;
    private final BlogRepository blogRepository;
    private final EventRepository eventRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ModuleRepository moduleRepository;
    private final ModuleService moduleService;
    private final LessonRepository lessonRepository;

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
                String raw = getCellValue(row.getCell(4));
                String dateOnly = raw.split("T")[0];
                LocalDate dob = LocalDate.parse(dateOnly);
                Gender gender = Gender.valueOf(getCellValue(row.getCell(5)).toUpperCase());
                String phone = getCellValue(row.getCell(6));
                String job = getCellValue(row.getCell(7));
                Role role = Role.valueOf(getCellValue(row.getCell(8)).toUpperCase());
                String address = getCellValue(row.getCell(9));
                UserStatus status = UserStatus.valueOf(getCellValue(row.getCell(10)).toUpperCase());
                AgeGroup group = AgeGroup.valueOf(getCellValue(row.getCell(11)));
                Instant createdAt = Instant.parse(getCellValue(row.getCell(12)));
                Instant updatedAt = Instant.parse(getCellValue(row.getCell(13)));

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
                        .ageGroup(group)
                        .createdAt(createdAt)
                        .updatedAt(updatedAt)
                        .build();
                users.add(user);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Users at line " + (i + 1) + ": " + e.getMessage(), e);
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
                String name = getCellValue(row.getCell(0));
                String img = getCellValue(row.getCell(1));
                Degree degree = Degree.valueOf(getCellValue(row.getCell(2)));
                String institution = getCellValue(row.getCell(3));
                Integer year = Integer.valueOf(getCellValue(row.getCell(4)));
                CourseStatus status = CourseStatus.valueOf(getCellValue(row.getCell(5)).toUpperCase());
                String consultantUsername = getCellValue(row.getCell(6));
                User consultant = userService.getUserEntity(consultantUsername);

                Qualification qualification = Qualification.builder()
                        .name(name)
                        .image(img)
                        .degree(degree)
                        .institution(institution)
                        .year(year)
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
                String content = getCellValue(row.getCell(7));
                Integer time = Integer.valueOf(getCellValue(row.getCell(8)));
                AgeGroup group = AgeGroup.valueOf(getCellValue(row.getCell(9)));

                Blog blog = Blog.builder()
                        .blogName(name)
                        .rate(rate)
                        .image(img)
                        .description(description)
                        .blogType(type)
                        .blogStatus(status)
                        .member(member)
                        .content(content)
                        .readingTime(time)
                        .ageGroup(group)
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
                UUID courseID = UUID.fromString(getCellValue(row.getCell(7)));

                Course course = Course.builder()
                        .courseID(courseID)
                        .courseName(name)
                        .quantity(quantity)
                        .duration(duration)
                        .image(img)
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
    public void importModulesFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Modules");
        List<Module> modules = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                UUID moduleID = UUID.fromString(getCellValue(row.getCell(0)));
                String name = getCellValue(row.getCell(1));
                CourseStatus status = CourseStatus.valueOf(getCellValue(row.getCell(2)).toUpperCase());
                UUID courseID = UUID.fromString(getCellValue(row.getCell(3)));
                Course course = courseService.getCourseEntity(courseID);

                Module module = Module.builder()
                        .moduleID(moduleID)
                        .moduleName(name)
                        .status(status)
                        .course(course)
                        .build();
                modules.add(module);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Modules at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        moduleRepository.saveAll(modules);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importLessonsFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Lessons");
        List<Lesson> lessons = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                UUID id = UUID.fromString(getCellValue(row.getCell(0)));
                String name = getCellValue(row.getCell(1));
                int duration = Integer.parseInt(getCellValue(row.getCell(2)));
                String objective = getCellValue(row.getCell(3));
                String content = getCellValue(row.getCell(4));
                String resrc = getCellValue(row.getCell(5));
                CourseStatus status = CourseStatus.valueOf(getCellValue(row.getCell(6)).toUpperCase());
                UUID moduleID = UUID.fromString(getCellValue(row.getCell(7)));
                Module module = moduleService.getModelEntity(moduleID);

                Lesson lesson = Lesson.builder()
                        .lessonID(id)
                        .lessonName(name)
                        .duration(duration)
                        .objective(objective)
                        .content(content)
                        .resource(resrc)
                        .status(status)
                        .module(module)
                        .build();
                lessons.add(lesson);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Lessons at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        lessonRepository.saveAll(lessons);
        workbook.close();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void importEnrollmentsFromExcel(InputStream inputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheet("Enrollments");
        List<Enrollment> enrollments = new ArrayList<>();

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || isRowEmpty(row)) continue;

            try {
                String memberUsername = getCellValue(row.getCell(0));
                User member = userService.getUserEntity(memberUsername);
                UUID courseID = UUID.fromString(getCellValue(row.getCell(1)));
                Course course = courseService.getCourseEntity(courseID);
                Instant startedAt = Instant.parse(getCellValue(row.getCell(2)));
                Instant endedAt = Instant.parse(getCellValue(row.getCell(3)));
                EnrollmentStatus status = EnrollmentStatus.valueOf(getCellValue(row.getCell(4)).toUpperCase());

                Enrollment enrollment = Enrollment.builder()
                        .member(member)
                        .course(course)
                        .startedAt(startedAt)
                        .endedAt(endedAt)
                        .status(status)
                        .build();
                enrollments.add(enrollment);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Enrollments at line " + (i + 1) + ": " + e.getMessage(), e);
            }
        }
        enrollmentRepository.saveAll(enrollments);
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
                AssessmentType type = AssessmentType.valueOf(getCellValue(row.getCell(1)));
                String link = getCellValue(row.getCell(2));
                String description = getCellValue(row.getCell(3));
                String details = getCellValue(row.getCell(4));
                CourseStatus status = CourseStatus.valueOf(getCellValue(row.getCell(5)));

                Assessment assessment = Assessment.builder()
                        .image(img)
                        .assessmentType(type)
                        .linkTest(link)
                        .description(description)
                        .details(details)
                        .status(status)
                        .build();
                assessments.add(assessment);
            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Assessments at line " + (i + 1) + ": " + e.getMessage(), e);
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

                LocalDateTime startDate = LocalDateTime.parse(getCellValue(row.getCell(6)));
                LocalDateTime endDate = LocalDateTime.parse(getCellValue(row.getCell(7)));

//                String subTitle = getCellValue(row.getCell(8));
//                String location = getCellValue(row.getCell(9));
//                Double fee = Double.valueOf(getCellValue(row.getCell(10)));
//                String details = getCellValue(row.getCell(11));
                AgeGroup ageGroup = AgeGroup.valueOf(getCellValue(row.getCell(8)));

                // Tạm thời chưa gán createdByStaff nếu không có thông tin trong Excel
                Event event = Event.builder()
                        .eventName(name)
                        .subTitle("No subtitle")
                        .duration(duration)
                        .quantity(quantity)
                        .description(description)
                        .image(img)
                        .status(status)
                        .startDate(startDate)
                        .endDate(endDate)
                        .location("FPT University")
                        .fee(0.0)
                        .details("No details")
                        .ageGroup(ageGroup)
                        .build();

            } catch (Exception e) {
                throw new RuntimeException("Error Excel import Events at line " + (i + 1) + ": " + e.getMessage(), e);
            }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
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
