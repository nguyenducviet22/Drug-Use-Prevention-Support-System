package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateUserRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.Gender;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.exception.AlreadyRegisteredException;
import com.swp.drug_use_prevention_support_system.exception.ResourceNotFoundException;
import com.swp.drug_use_prevention_support_system.mappers.UserMapper;
import com.swp.drug_use_prevention_support_system.repositories.AppointmentRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterUser_Success() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("uniqueUser")
                .password("Password1!")
                .role(Role.MEMBER)
                .build();
        User userEntity = User.builder()
                .username("uniqueUser")
                .password("Password1!")
                .build();
        User savedUser = User.builder()
                .username("uniqueUser")
                .password("encodedPassword")
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .build();
        UserResponse response = UserResponse.builder()
                .username("uniqueUser")
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.existsByUsername("uniqueUser")).thenReturn(false);
        when(userMapper.toEntity(request)).thenReturn(userEntity);
        when(passwordEncoder.encode("Password1!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userMapper.toDto(any(User.class))).thenReturn(response);

        UserResponse result = userService.register(request);

        assertEquals("uniqueUser", result.getUsername());
        assertEquals(Role.MEMBER, result.getRole());
        assertEquals(UserStatus.ACTIVE, result.getStatus());
        verify(userRepository).save(userCaptor.capture());
        assertEquals("encodedPassword", userCaptor.getValue().getPassword());
    }

    @Test
    void testCreateUserByAdmin_Success() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("adminUser")
                .password("AdminPass1!")
                .role(Role.STAFF)
                .build();
        User userEntity = User.builder()
                .username("adminUser")
                .password("AdminPass1!")
                .build();
        User registeredUser = User.builder()
                .username("adminUser")
                .password("encodedAdminPass")
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .build();
        User internalUser = User.builder()
                .username("adminUser")
                .password("encodedAdminPass")
                .role(Role.STAFF)
                .status(UserStatus.ACTIVE)
                .build();
        UserResponse response = UserResponse.builder()
                .username("adminUser")
                .role(Role.STAFF)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.existsByUsername("adminUser")).thenReturn(false);
        when(userMapper.toEntity(request)).thenReturn(userEntity);
        when(passwordEncoder.encode("AdminPass1!")).thenReturn("encodedAdminPass");
        when(userRepository.save(any(User.class))).thenReturn(registeredUser);
        when(userMapper.toDto(any(User.class))).thenReturn(response);
        when(userMapper.toEntity(any(UserResponse.class))).thenReturn(internalUser);

        UserResponse result = userService.createInternalUser(request);

        assertEquals("adminUser", result.getUsername());
        assertEquals(Role.STAFF, result.getRole());
        assertEquals(UserStatus.ACTIVE, result.getStatus());
        verify(userRepository, atLeastOnce()).save(any(User.class));
    }

    @Test
    void testUpdateUserProfile_Success() {
        String username = "profileUser";
        UpdateUserRequest updateRequest = UpdateUserRequest.builder()
                .email("new@email.com")
                .fullName("New Name")
                .dob(LocalDate.of(2000, 1, 1))
                .gender(Gender.MALE)
                .phoneNumber("012-345-6789")
                .job("Engineer")
                .address("123 Main St")
                .build();
        User user = User.builder()
                .username(username)
                .dob(LocalDate.of(1990, 1, 1))
                .build();
        User updatedUser = User.builder()
                .username(username)
                .email("new@email.com")
                .fullName("New Name")
                .dob(LocalDate.of(2000, 1, 1))
                .gender(Gender.MALE)
                .phoneNumber("012-345-6789")
                .job("Engineer")
                .address("123 Main St")
                .ageGroup(AgeGroup.ADULT)
                .build();
        UserResponse response = UserResponse.builder()
                .username(username)
                .email("new@email.com")
                .fullName("New Name")
                .dob(LocalDate.of(2000, 1, 1))
                .gender(Gender.MALE)
                .phoneNumber("012-345-6789")
                .job("Engineer")
                .address("123 Main St")
                .ageGroup(AgeGroup.ADULT)
                .build();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
        when(userMapper.toDto(any(User.class))).thenReturn(response);

        UserResponse result = userService.updateUser(username, updateRequest);

        assertEquals("new@email.com", result.getEmail());
        assertEquals("New Name", result.getFullName());
        assertEquals(LocalDate.of(2000, 1, 1), result.getDob());
        assertEquals(Gender.MALE, result.getGender());
        assertEquals("012-345-6789", result.getPhoneNumber());
        assertEquals("Engineer", result.getJob());
        assertEquals("123 Main St", result.getAddress());
        assertEquals(AgeGroup.ADULT, result.getAgeGroup());
    }

    @Test
    void testRegisterUser_DuplicateUsername_ThrowsException() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("duplicateUser")
                .password("Password1!")
                .build();

        when(userRepository.existsByUsername("duplicateUser")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.register(request));
        assertTrue(ex.getMessage().contains("Username existed with: duplicateUser"));
    }

    @Test
    void testGetUserEntity_NonExistentUsername_ThrowsException() {
        when(userRepository.findByUsername("notfound")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> userService.getUserEntity("notfound"));
    }

    @Test
    void testToggleUserStatus_NonExistentUser_ThrowsException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> userService.toggleUserStatus("ghost"));
    }

    @Test
    void testUpdateUserRole_AdminSuccess() {
        String username = "roleUser";
        User user = User.builder()
                .username(username)
                .role(Role.MEMBER)
                .build();
        User updatedUser = User.builder()
                .username(username)
                .role(Role.CONSULTANT)
                .build();
        UserResponse response = UserResponse.builder()
                .username(username)
                .role(Role.CONSULTANT)
                .build();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
        when(userMapper.toDto(any(User.class))).thenReturn(response);

        UserResponse result = userService.updateUserRole(username, Role.CONSULTANT);

        assertEquals(Role.CONSULTANT, result.getRole());
        verify(userRepository).save(userCaptor.capture());
        assertEquals(Role.CONSULTANT, userCaptor.getValue().getRole());
    }

    @Test
    void testChangePassword_NonExistentUser_ThrowsException() {
        when(userRepository.findByUsername("noUser")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> userService.changePassword("noUser", "newPass123!"));
    }

    @Test
    void testGetAllUsers_AsConsultantOrStaff_Success() {
        User user1 = User.builder().username("user1").build();
        User user2 = User.builder().username("user2").build();
        List<User> users = Arrays.asList(user1, user2);
        UserResponse dto1 = UserResponse.builder().username("user1").build();
        UserResponse dto2 = UserResponse.builder().username("user2").build();

        when(userRepository.findAll()).thenReturn(users);
        when(userMapper.toDto(user1)).thenReturn(dto1);
        when(userMapper.toDto(user2)).thenReturn(dto2);

        List<UserResponse> result = userService.getAllUsers();

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(u -> u.getUsername().equals("user1")));
        assertTrue(result.stream().anyMatch(u -> u.getUsername().equals("user2")));
    }

    @Test
    void testDeletePermanentUser_NonExistentUser_ThrowsException() {
        when(userRepository.findByUsername("missingUser")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> userService.deletePermanentUser("missingUser"));
    }

    @Test
    void testGetUserStats_AdminSuccess() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRole(Role.CONSULTANT)).thenReturn(2);
        when(userRepository.countByRole(Role.MANAGER)).thenReturn(1);
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        when(userRepository.countUsersByMonth(lastMonth.getYear(), lastMonth.getMonthValue())).thenReturn(8);

        Map<String, Object> stats = userService.getUserStats();

        assertEquals(10L, stats.get("totalUsers"));
        assertEquals(2, stats.get("consultants"));
        assertEquals(1, stats.get("managers"));
        assertTrue(stats.containsKey("growthPercent"));
    }

    @Test
    void testUpdateUserRole_InvalidRole_ThrowsException() {
        String username = "userX";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> userService.updateUserRole(username, null));
    }

    @Test
    void testToggleUserStatus_AdminSuccess() {
        String username = "toggleUser";
        User user = User.builder()
                .username(username)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.toggleUserStatus(username);

        assertEquals(UserStatus.INACTIVE, user.getStatus());

        // Toggle back to ACTIVE
        user.setStatus(UserStatus.INACTIVE);
        userService.toggleUserStatus(username);
        assertEquals(UserStatus.ACTIVE, user.getStatus());
    }

    @Test
    void testGetMyInfo_Unauthenticated_ThrowsException() {
        SecurityContext context = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(context.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenThrow(new RuntimeException("Not authenticated"));
        SecurityContextHolder.setContext(context);

        assertThrows(RuntimeException.class, () -> userService.getMyInfo());
    }

    @Test
    void testGetUserDemographics_AdminSuccess() {
        List<Object[]> result = new ArrayList<>();
        result.add(new Object[]{AgeGroup.ADOLESCENT, 3L});
        result.add(new Object[]{AgeGroup.ADULT, 5L});
        result.add(new Object[]{AgeGroup.SENIOR, 2L});
        when(userRepository.countUsersByAgeGroup()).thenReturn(result);

        Map<String, Object> demographics = userService.getUserDemographics();

        assertTrue(demographics.containsKey("labels"));
        assertTrue(demographics.containsKey("data"));
        List<String> labels = (List<String>) demographics.get("labels");
        List<Long> data = (List<Long>) demographics.get("data");
        assertEquals(Arrays.asList("Adolescent", "Adult", "Senior"), labels);
        assertEquals(Arrays.asList(3L, 5L, 2L), data);
    }

    @Test
    void testUpdateUserProfile_InvalidEmailOrPhone_ThrowsValidationException() {
        String username = "invalidUser";
        UpdateUserRequest updateRequest = UpdateUserRequest.builder()
                .email("invalid-email")
                .fullName("Name")
                .dob(LocalDate.of(2000, 1, 1))
                .gender(Gender.FEMALE)
                .phoneNumber("invalid-phone")
                .job("Job")
                .address("Address")
                .build();
        User user = User.builder()
                .username(username)
                .build();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // Simulate validation exception thrown by repository or validation layer
        doThrow(new jakarta.validation.ConstraintViolationException("Invalid format", new HashSet<>()))
                .when(userRepository).save(any(User.class));

        assertThrows(jakarta.validation.ConstraintViolationException.class, () -> userService.updateUser(username, updateRequest));
    }
}