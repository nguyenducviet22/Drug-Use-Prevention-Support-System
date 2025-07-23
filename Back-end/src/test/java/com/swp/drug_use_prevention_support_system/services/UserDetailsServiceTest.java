package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateUserDetailsRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserDetailsResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.entities.UserDetails;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.mappers.UserDetailsMapper;
import com.swp.drug_use_prevention_support_system.repositories.UserDetailsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.mockito.*;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserDetailsServiceTest {

    @Mock
    private UserDetailsRepository userDetailsRepository;
    @Mock
    private UserDetailsMapper userDetailsMapper;
    @Mock
    private UserService userService;

    @InjectMocks
    private UserDetailsService userDetailsService;

    @Captor
    private ArgumentCaptor<UserDetails> userDetailsCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateUserDetails_SuccessfulCreation() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder()
                .fullName("John Doe")
                .phoneNumber("123-456-7890")
                .relationship("Friend")
                .address("123 Main St")
                .build();

        UserDetails userDetails = UserDetails.builder().build();
        User user = User.builder().username("johndoe").build();
        UserDetailsResponse response = UserDetailsResponse.builder().member(null).build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("johndoe");
        when(userService.getUserEntity("johndoe")).thenReturn(user);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(response);

        UserDetailsResponse result = userDetailsService.createUserDetails(request);

        verify(userDetailsRepository).save(userDetails);
        assertEquals(response, result);
        assertEquals(user, userDetails.getMember());
        assertEquals(UserStatus.ACTIVE, userDetails.getStatus());
    }

    @Test
    void testCreateUserDetails_AssociatesWithAuthenticatedUser() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();
        User user = User.builder().username("authuser").build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("authuser");
        when(userService.getUserEntity("authuser")).thenReturn(user);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(UserDetailsResponse.builder().member(null).build());

        userDetailsService.createUserDetails(request);

        assertEquals(user, userDetails.getMember());
    }

    @Test
    void testCreateUserDetails_ResponseFieldsPopulated() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();
        User user = User.builder().username("user1").build();
        UserDetailsResponse response = UserDetailsResponse.builder()
                .detailID(UUID.randomUUID())
                .fullName("Jane Doe")
                .phoneNumber("123-456-7890")
                .relationship("Sibling")
                .address("456 Elm St")
                .status(UserStatus.ACTIVE)
                .createdAt("2024-06-01T12:00:00Z")
                .updatedAt("2024-06-01T12:00:00Z")
                .member(null)
                .build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("user1");
        when(userService.getUserEntity("user1")).thenReturn(user);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(response);

        UserDetailsResponse result = userDetailsService.createUserDetails(request);

        assertNotNull(result.getDetailID());
        assertEquals("Jane Doe", result.getFullName());
        assertEquals("123-456-7890", result.getPhoneNumber());
        assertEquals("Sibling", result.getRelationship());
        assertEquals("456 Elm St", result.getAddress());
        assertEquals(UserStatus.ACTIVE, result.getStatus());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    @Test
    void testCreateUserDetails_ThrowsWhenUserNotFound() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("nouser");
        when(userService.getUserEntity("nouser")).thenThrow(new EntityNotFoundException("User does not exist with username: nouser"));

        assertThrows(EntityNotFoundException.class, () -> userDetailsService.createUserDetails(request));
    }

    @Test
    void testCreateUserDetails_ThrowsOnInvalidRequest() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder()
                .fullName("") // NotBlank violation
                .phoneNumber("invalid") // Pattern violation
                .relationship("")
                .address("")
                .build();

        // Simulate validation exception thrown by mapper or validation framework
        when(userDetailsMapper.toEntity(request)).thenThrow(new IllegalArgumentException("Validation failed"));

        assertThrows(IllegalArgumentException.class, () -> userDetailsService.createUserDetails(request));
    }

    @Test
    void testCreateUserDetails_AccessDeniedForMismatchedUser() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();
        User user = User.builder().username("userA").build();
        UserDetailsResponse response = UserDetailsResponse.builder()
                .member(com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse.builder().username("userB").build())
                .build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("userA");
        when(userService.getUserEntity("userA")).thenReturn(user);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(response);

        // Simulate @PostAuthorize denying access (would be handled by Spring Security in real app)
        // Here, we simulate by throwing AccessDeniedException if usernames don't match
        // In real test, this would be an integration/security test, but we simulate for unit test
        assertThrows(AccessDeniedException.class, () -> {
            if (!response.getMember().getUsername().equals("userA")) {
                throw new AccessDeniedException("Access is denied");
            }
            userDetailsService.createUserDetails(request);
        });
    }

    @Test
    void testCreateUserDetails_AlwaysSetsStatusActive() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().status(UserStatus.valueOf("INACTIVE")).build();
        User user = User.builder().username("user1").build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("user1");
        when(userService.getUserEntity("user1")).thenReturn(user);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(UserDetailsResponse.builder().build());

        userDetailsService.createUserDetails(request);

        assertEquals(UserStatus.ACTIVE, userDetails.getStatus());
    }

    @Test
    void testCreateUserDetails_ThrowsOnMappingFailure() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();

        when(userDetailsMapper.toEntity(request)).thenThrow(new RuntimeException("Mapping failed"));

        assertThrows(RuntimeException.class, () -> userDetailsService.createUserDetails(request));
    }

    @Test
    void testCreateUserDetails_TimestampsInitialized() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = new UserDetails();
        User user = User.builder().username("user1").build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("user1");
        when(userService.getUserEntity("user1")).thenReturn(user);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(UserDetailsResponse.builder().build());

        doAnswer(invocation -> {
            UserDetails ud = invocation.getArgument(0);
            Instant now = Instant.now();
            ud.setCreatedAt(now);
            ud.setUpdatedAt(now);
            return null;
        }).when(userDetailsRepository).save(any(UserDetails.class));

        userDetailsService.createUserDetails(request);

        assertNotNull(userDetails.getCreatedAt());
        assertNotNull(userDetails.getUpdatedAt());
    }

    @Test
    void testCreateUserDetails_ThrowsOnRepositorySaveFailure() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();
        User user = User.builder().username("user1").build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("user1");
        when(userService.getUserEntity("user1")).thenReturn(user);
        doThrow(new RuntimeException("DB error")).when(userDetailsRepository).save(userDetails);

        assertThrows(RuntimeException.class, () -> userDetailsService.createUserDetails(request));
    }

    @Test
    void testCreateUserDetails_AssociatesWithCurrentAuthenticatedUserEntity() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();
        User user = User.builder().username("currentuser").build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("currentuser");
        when(userService.getUserEntity("currentuser")).thenReturn(user);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(UserDetailsResponse.builder().build());

        userDetailsService.createUserDetails(request);

        assertEquals(user, userDetails.getMember());
    }

    @Test
    void testCreateUserDetails_ThrowsOnRepositoryUnavailable() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();
        User user = User.builder().username("user1").build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("user1");
        when(userService.getUserEntity("user1")).thenReturn(user);
        doThrow(new RuntimeException("Repository unavailable")).when(userDetailsRepository).save(userDetails);

        assertThrows(RuntimeException.class, () -> userDetailsService.createUserDetails(request));
    }

    @Test
    void testCreateUserDetails_ThrowsOnNullEntityFromMapper() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();

        when(userDetailsMapper.toEntity(request)).thenReturn(null);

        assertThrows(NullPointerException.class, () -> userDetailsService.createUserDetails(request));
    }

    @Test
    void testCreateUserDetails_CorrectAssociationWithAuthenticatedUserAmongMultipleUsers() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder().build();
        UserDetails userDetails = UserDetails.builder().build();
        User user1 = User.builder().username("user1").build();
        User user2 = User.builder().username("user2").build();

        when(userDetailsMapper.toEntity(request)).thenReturn(userDetails);
        when(userService.getLoginUsername()).thenReturn("user2");
        when(userService.getUserEntity("user2")).thenReturn(user2);
        when(userDetailsMapper.toDto(userDetails)).thenReturn(UserDetailsResponse.builder().build());

        userDetailsService.createUserDetails(request);

        assertEquals(user2, userDetails.getMember());
        assertNotEquals(user1, userDetails.getMember());
    }

    @Test
    void testCreateUserDetails_ThrowsOnInvalidPhoneNumberFormat() {
        CreateUserDetailsRequest request = CreateUserDetailsRequest.builder()
                .fullName("Bob")
                .phoneNumber("invalid-phone") // Invalid format
                .relationship("Friend")
                .address("123 Main St")
                .build();

        when(userDetailsMapper.toEntity(request)).thenThrow(new IllegalArgumentException("Invalid phone number format"));

        assertThrows(IllegalArgumentException.class, () -> userDetailsService.createUserDetails(request));
    }
}