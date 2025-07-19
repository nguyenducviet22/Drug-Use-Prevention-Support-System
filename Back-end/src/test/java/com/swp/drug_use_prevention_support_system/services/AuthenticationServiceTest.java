package com.swp.drug_use_prevention_support_system.services;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.AuthenticationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.mappers.UserMapper;
import com.swp.drug_use_prevention_support_system.repositories.InvalidatedTokenRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private InvalidatedTokenRepository invalidatedTokenRepository;
    @Mock
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService; // Fully qualified to avoid conflict with UserDetails

    @InjectMocks
    private AuthenticationService authenticationService;

    private final String SECRET_KEY = "a_very_long_and_complex_secret_key_for_jwt_testing_1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private final String ISSUER = "test-issuer";
    private final Long JWT_EXPIRY_MS = 3600000L; // 1 hour
    private final Long JWT_REFRESH_SECONDS = 86400L; // 24 hours

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        passwordEncoder = new BCryptPasswordEncoder();

        // Inject @Value fields using ReflectionTestUtils
        ReflectionTestUtils.setField(authenticationService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(authenticationService, "issuer", ISSUER);
        ReflectionTestUtils.setField(authenticationService, "jwtExpiryMs", JWT_EXPIRY_MS);
        ReflectionTestUtils.setField(authenticationService, "jwtRefresh", JWT_REFRESH_SECONDS);
    }

    // Helper to generate a valid token for testing internal methods
    private String generateTestToken(String username, Role role, Instant issueTime, Instant expirationTime, String jit) throws JOSEException {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer(ISSUER)
                .issueTime(Date.from(issueTime))
                .expirationTime(Date.from(expirationTime))
                .jwtID(jit)
                .claim("scope", role.name())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        jwsObject.sign(new MACSigner(SECRET_KEY.getBytes()));
        return jwsObject.serialize();
    }

    // --- 1. authenticate tests ---
    @Test
    void testAuthenticate_Success() {
        // Arrange
        String rawPassword = "password123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = User.builder()
                .username("testuser")
                .password(encodedPassword)
                .status(UserStatus.ACTIVE)
                .build();
        UserResponse userResponse = UserResponse.builder()
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .build();
        AuthenticationRequest request = new AuthenticationRequest("testuser", rawPassword);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(userResponse);

        // Act
        UserResponse actualResponse = authenticationService.authenticate(request);

        // Assert
        assertNotNull(actualResponse);
        assertEquals("testuser", actualResponse.getUsername());
        verify(userRepository).findByUsername("testuser");
        verify(userMapper).toDto(user);
    }

    @Test
    void testAuthenticate_BadCredentials_IncorrectPassword() {
        // Arrange
        String rawPassword = "password123";
        String encodedPassword = passwordEncoder.encode("wrongpassword"); // Mismatch
        User user = User.builder()
                .username("testuser")
                .password(encodedPassword)
                .status(UserStatus.ACTIVE)
                .build();
        AuthenticationRequest request = new AuthenticationRequest("testuser", rawPassword);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act & Assert
        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authenticationService.authenticate(request));
        assertEquals("Incorrect username or password!", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verifyNoInteractions(userMapper);
    }

    @Test
    void testAuthenticate_BadCredentials_UserNotFound() {
        // Arrange
        AuthenticationRequest request = new AuthenticationRequest("nonexistent", "password123");

        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authenticationService.authenticate(request));
        assertEquals("Incorrect username or password!", exception.getMessage());
        verify(userRepository).findByUsername("nonexistent");
        verifyNoInteractions(userMapper);
    }

    @Test
    void testAuthenticate_BadCredentials_InactiveUser() {
        // Arrange
        String rawPassword = "password123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = User.builder()
                .username("testuser")
                .password(encodedPassword)
                .status(UserStatus.INACTIVE) // Inactive status
                .build();
        AuthenticationRequest request = new AuthenticationRequest("testuser", rawPassword);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act & Assert
        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authenticationService.authenticate(request));
        assertEquals("Your account is Locked for Security reasons. Please contact support: 0862886128", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verifyNoInteractions(userMapper);
    }

    // --- 2. generateToken tests ---
    @Test
    void testGenerateToken_Success() throws JOSEException, ParseException {
        // Arrange
        UserResponse userResponse = UserResponse.builder()
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .build();

        // Act
        String token = authenticationService.generateToken(userResponse);

        // Assert
        assertNotNull(token);
        assertTrue(token.length() > 0);

        // Optionally, verify the token content (signature, claims)
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWSVerifier verifier = new MACVerifier(SECRET_KEY.getBytes());
        assertTrue(signedJWT.verify(verifier)); // Verify signature

        JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
        assertEquals("testuser", claims.getSubject());
        assertEquals(ISSUER, claims.getIssuer());
        assertEquals(userResponse.getRole().name(), claims.getClaim("scope"));
        assertNotNull(claims.getIssueTime());
        assertNotNull(claims.getExpirationTime());
        assertNotNull(claims.getJWTID());
        assertTrue(claims.getExpirationTime().getTime() > System.currentTimeMillis());
    }

    // --- 3. introspect tests ---
    // --- 4. logout tests ---
    // --- 5. refreshToken tests ---

    // --- 6. findOrCreateUserFromGoogle tests ---
    @Test
    void testFindOrCreateUserFromGoogle_UserExists() {
        // Arrange
        String email = "googleuser@example.com";
        String name = "Google User";
        User existingUser = User.builder()
                .username(email)
                .email(email)
                .fullName(name)
                .build();
        UserResponse userResponse = UserResponse.builder()
                .username(email)
                .email(email)
                .fullName(name)
                .build();

        when(userRepository.findByUsername(email)).thenReturn(Optional.of(existingUser));
        when(userMapper.toDto(existingUser)).thenReturn(userResponse);

        // Act
        UserResponse actualResponse = authenticationService.findOrCreateUserFromGoogle(email, name);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(email, actualResponse.getUsername());
        assertEquals(name, actualResponse.getFullName());
        verify(userRepository).findByUsername(email);
        verify(userMapper).toDto(existingUser);
        verifyNoMoreInteractions(userRepository); // save should not be called
    }

    @Test
    void testFindOrCreateUserFromGoogle_UserDoesNotExist_CreatesNewUser() {
        // Arrange
        String email = "newgoogleuser@example.com";
        String name = "New Google User";
        User newUser = User.builder()
                .username(email)
                .email(email)
                .fullName(name)
                .password("") // Default empty password
                .status(UserStatus.ACTIVE)
                .role(null) // Default null role
                .build();
        UserResponse userResponse = UserResponse.builder()
                .username(email)
                .email(email)
                .fullName(name)
                .build();

        when(userRepository.findByUsername(email)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(userMapper.toDto(any(User.class))).thenReturn(userResponse);

        // Act
        UserResponse actualResponse = authenticationService.findOrCreateUserFromGoogle(email, name);

        // Assert
        assertNotNull(actualResponse);
        assertEquals(email, actualResponse.getUsername());
        assertEquals(name, actualResponse.getFullName());
        verify(userRepository).findByUsername(email);
        verify(userRepository).save(argThat(user ->
                user.getUsername().equals(email) &&
                        user.getEmail().equals(email) &&
                        user.getFullName().equals(name) &&
                        user.getPassword().equals("") &&
                        user.getStatus() == UserStatus.ACTIVE &&
                        user.getRole() == null
        ));
        verify(userMapper).toDto(any(User.class));
    }
}