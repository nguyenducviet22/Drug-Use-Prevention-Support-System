package com.swp.drug_use_prevention_support_system.controllers;

import com.nimbusds.jose.JOSEException;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.AuthenticationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.IntrospectRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.LogoutRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.RefreshRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.AuthenticationResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.IntrospectResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.services.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;

import java.text.ParseException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthenticationControllerTest {

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private AuthenticationController authenticationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. authenticate tests ---
    @Test
    void testAuthenticate_Success() {
        AuthenticationRequest request = new AuthenticationRequest("testuser", "password");
        UserResponse userResponse = UserResponse.builder().username("testuser").build();
        String token = "mocked_jwt_token";

        when(authenticationService.authenticate(request)).thenReturn(userResponse);
        when(authenticationService.generateToken(userResponse)).thenReturn(token);

        ResponseEntity<AuthenticationResponse> responseEntity = authenticationController.authenticate(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().isAuthenticated());
        assertEquals(token, responseEntity.getBody().getToken());
        verify(authenticationService).authenticate(request);
        verify(authenticationService).generateToken(userResponse);
    }

    @Test
    void testAuthenticate_InvalidCredentials() {
        AuthenticationRequest request = new AuthenticationRequest("wronguser", "wrongpass");

        // Simulate AuthenticationException from the service layer
        when(authenticationService.authenticate(request)).thenThrow(new AuthenticationException("Invalid username or password") {});

        Exception exception = assertThrows(AuthenticationException.class, () -> authenticationController.authenticate(request));
        assertTrue(exception.getMessage().contains("Invalid username or password"));
        verify(authenticationService).authenticate(request);
//        verifyNoMoreInterinterations(authenticationService); // generateToken should not be called
    }

    // --- 2. introspect tests ---
    @Test
    void testIntrospect_ValidToken() {
        IntrospectRequest request = new IntrospectRequest("valid_token");
        when(authenticationService.introspect(request)).thenReturn(true);

        ResponseEntity<IntrospectResponse> responseEntity = authenticationController.introspect(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().isValid());
        verify(authenticationService).introspect(request);
    }

    @Test
    void testIntrospect_InvalidToken() {
        IntrospectRequest request = new IntrospectRequest("invalid_token");
        when(authenticationService.introspect(request)).thenReturn(false);

        ResponseEntity<IntrospectResponse> responseEntity = authenticationController.introspect(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertFalse(responseEntity.getBody().isValid());
        verify(authenticationService).introspect(request);
    }

    // --- 3. logout tests ---
    @Test
    void testLogout_Success() throws Exception {
        LogoutRequest request = new LogoutRequest("token_to_logout");
        doNothing().when(authenticationService).logout(request);

        ResponseEntity<Void> responseEntity = authenticationController.logout(request);

        assertEquals(HttpStatus.NO_CONTENT, responseEntity.getStatusCode());
        assertNull(responseEntity.getBody()); // No content in body for 204
        verify(authenticationService).logout(request);
    }

    @Test
    void testLogout_Exception() throws Exception {
        LogoutRequest request = new LogoutRequest("token_to_logout");
        doThrow(new Exception("Logout failed")).when(authenticationService).logout(request);

        Exception exception = assertThrows(Exception.class, () -> authenticationController.logout(request));
        assertTrue(exception.getMessage().contains("Logout failed"));
        verify(authenticationService).logout(request);
    }

    // --- 4. refreshToken tests ---
    @Test
    void testRefreshToken_Success() throws ParseException, JOSEException {
        RefreshRequest request = new RefreshRequest("refresh_token");
        UserResponse userResponse = UserResponse.builder().username("refreshedUser").build();
        String newToken = "new_jwt_token";

        when(authenticationService.refreshToken(request)).thenReturn(userResponse);
        when(authenticationService.generateToken(userResponse)).thenReturn(newToken);

        ResponseEntity<AuthenticationResponse> responseEntity = authenticationController.refreshToken(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().isAuthenticated());
        assertEquals(newToken, responseEntity.getBody().getToken());
        verify(authenticationService).refreshToken(request);
        verify(authenticationService).generateToken(userResponse);
    }

    @Test
    void testRefreshToken_ParseException() throws ParseException, JOSEException {
        RefreshRequest request = new RefreshRequest("invalid_format_token");
        when(authenticationService.refreshToken(request)).thenThrow(new ParseException("Invalid token format", 0));

        Exception exception = assertThrows(ParseException.class, () -> authenticationController.refreshToken(request));
        assertTrue(exception.getMessage().contains("Invalid token format"));
        verify(authenticationService).refreshToken(request);
//        verifyNoMoreInterinterations(authenticationService);
    }

    @Test
    void testRefreshToken_JOSEException() throws ParseException, JOSEException {
        RefreshRequest request = new RefreshRequest("corrupted_token");
        when(authenticationService.refreshToken(request)).thenThrow(new JOSEException("Token signature invalid"));

        Exception exception = assertThrows(JOSEException.class, () -> authenticationController.refreshToken(request));
        assertTrue(exception.getMessage().contains("Token signature invalid"));
        verify(authenticationService).refreshToken(request);
//        verifyNoMoreInterinterations(authenticationService);
    }

    @Test
    void testRefreshToken_AuthenticationExceptionFromService() throws ParseException, JOSEException {
        RefreshRequest request = new RefreshRequest("expired_token");
        when(authenticationService.refreshToken(request)).thenThrow(new AuthenticationException("Token expired") {});

        Exception exception = assertThrows(AuthenticationException.class, () -> authenticationController.refreshToken(request));
        assertTrue(exception.getMessage().contains("Token expired"));
        verify(authenticationService).refreshToken(request);
//        verifyNoMoreInterinterations(authenticationService);
    }
}