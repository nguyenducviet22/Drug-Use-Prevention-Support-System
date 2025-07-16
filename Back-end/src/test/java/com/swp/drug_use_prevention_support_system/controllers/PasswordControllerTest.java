package com.swp.drug_use_prevention_support_system.controllers;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.ForgotPasswordRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.ResetPasswordRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ForgotPasswordResponse;
import com.swp.drug_use_prevention_support_system.services.PasswordService;
import jakarta.mail.MessagingException;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PasswordControllerTest {

    @Mock
    private PasswordService passwordService;

    @InjectMocks
    private PasswordController passwordController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. forgotPassword tests ---
    @Test
    void testForgotPassword_Success() throws MessagingException {
        ForgotPasswordRequest request = new ForgotPasswordRequest("user@example.com");
        ForgotPasswordResponse mockResponse = ForgotPasswordResponse.builder()
                .email("user@example.com")
                .otp("123456")
                .expiryTime("2024-07-18T10:00:00Z")
                .build();

        when(passwordService.generateOtp(request)).thenReturn(mockResponse);
        doNothing().when(passwordService).sendOtpEmail(mockResponse.getEmail(), mockResponse.getOtp());

        ResponseEntity<ApiResponse<ForgotPasswordResponse>> responseEntity = passwordController.forgotPassword(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(mockResponse.getEmail(), responseEntity.getBody().getData().getEmail());
        assertEquals(HttpStatus.OK.value(), responseEntity.getBody().getStatus());
        verify(passwordService).generateOtp(request);
        verify(passwordService).sendOtpEmail(mockResponse.getEmail(), mockResponse.getOtp());
    }

    @Test
    void testForgotPassword_MessagingException() throws MessagingException {
        ForgotPasswordRequest request = new ForgotPasswordRequest("user@example.com");
        ForgotPasswordResponse mockResponse = ForgotPasswordResponse.builder()
                .email("user@example.com")
                .otp("123456")
                .expiryTime("2024-07-18T10:00:00Z")
                .build();

        when(passwordService.generateOtp(request)).thenReturn(mockResponse);
        doThrow(new MessagingException("Email service unavailable")).when(passwordService).sendOtpEmail(mockResponse.getEmail(), mockResponse.getOtp());

        Exception exception = assertThrows(MessagingException.class, () -> passwordController.forgotPassword(request));
        assertTrue(exception.getMessage().contains("Email service unavailable"));
        verify(passwordService).generateOtp(request);
        verify(passwordService).sendOtpEmail(mockResponse.getEmail(), mockResponse.getOtp());
    }

    @Test
    void testForgotPassword_UserNotFound() throws MessagingException {
        ForgotPasswordRequest request = new ForgotPasswordRequest("nonexistent@example.com");
        // Assuming generateOtp throws NoSuchElementException if user not found
        when(passwordService.generateOtp(request)).thenThrow(new NoSuchElementException("User with this email not found"));

        Exception exception = assertThrows(NoSuchElementException.class, () -> passwordController.forgotPassword(request));
        assertTrue(exception.getMessage().contains("User with this email not found"));
        verify(passwordService).generateOtp(request);
        verifyNoMoreInteractions(passwordService); // sendOtpEmail should not be called
    }

    @Test
    void testForgotPassword_InvalidEmailFormat() throws MessagingException {
        ForgotPasswordRequest invalidRequest = new ForgotPasswordRequest("invalid-email");
        // Assuming @Email validation happens at the controller level or service throws ConstraintViolationException
        when(passwordService.generateOtp(invalidRequest)).thenThrow(new ConstraintViolationException("Email format invalid", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> passwordController.forgotPassword(invalidRequest));
        verify(passwordService).generateOtp(invalidRequest);
        verifyNoMoreInteractions(passwordService);
    }

    // --- 2. resetPassword tests ---
    @Test
    void testResetPassword_Success() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("user@example.com")
                .username("testuser")
                .otp("valid_otp")
                .newPassword("NewPassword123!")
                .confirm("NewPassword123!")
                .build();

        when(passwordService.verifyOtp(request)).thenReturn(true);

        ResponseEntity<String> responseEntity = passwordController.resetPassword(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals("Password has been changed successfully", responseEntity.getBody());
        verify(passwordService).verifyOtp(request);
    }

    @Test
    void testResetPassword_InvalidOtp() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("user@example.com")
                .username("testuser")
                .otp("invalid_otp")
                .newPassword("NewPassword123!")
                .confirm("NewPassword123!")
                .build();

        when(passwordService.verifyOtp(request)).thenReturn(false);

        ResponseEntity<String> responseEntity = passwordController.resetPassword(request);

        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals("Invalid or Expired OTP!", responseEntity.getBody());
        verify(passwordService).verifyOtp(request);
    }

    @Test
    void testResetPassword_ExpiredOtp() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("user@example.com")
                .username("testuser")
                .otp("expired_otp")
                .newPassword("NewPassword123!")
                .confirm("NewPassword123!")
                .build();

        when(passwordService.verifyOtp(request)).thenReturn(false); // Service returns false for expired OTP

        ResponseEntity<String> responseEntity = passwordController.resetPassword(request);

        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals("Invalid or Expired OTP!", responseEntity.getBody());
        verify(passwordService).verifyOtp(request);
    }

    @Test
    void testResetPassword_InvalidRequest_EmailFormat() {
        ResetPasswordRequest invalidRequest = ResetPasswordRequest.builder()
                .email("bad-email") // Invalid email format
                .username("testuser")
                .otp("123456")
                .newPassword("NewPassword123!")
                .confirm("NewPassword123!")
                .build();

        // Simulate validation error from service or controller's @Valid
        when(passwordService.verifyOtp(invalidRequest)).thenThrow(new ConstraintViolationException("Email format invalid", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> passwordController.resetPassword(invalidRequest));
        verify(passwordService).verifyOtp(invalidRequest);
    }

    @Test
    void testResetPassword_InvalidRequest_PasswordFormat() {
        ResetPasswordRequest invalidRequest = ResetPasswordRequest.builder()
                .email("user@example.com")
                .username("testuser")
                .otp("123456")
                .newPassword("short") // Invalid password format
                .confirm("short")
                .build();

        // Simulate validation error from service or controller's @Valid
        when(passwordService.verifyOtp(invalidRequest)).thenThrow(new ConstraintViolationException("Password must be at least 8 characters with uppercase, lowercase, number, and special character", Collections.emptySet()));

        assertThrows(ConstraintViolationException.class, () -> passwordController.resetPassword(invalidRequest));
        verify(passwordService).verifyOtp(invalidRequest);
    }

    @Test
    void testResetPassword_InvalidRequest_PasswordMismatch() {
        ResetPasswordRequest invalidRequest = ResetPasswordRequest.builder()
                .email("user@example.com")
                .username("testuser")
                .otp("123456")
                .newPassword("NewPassword123!")
                .confirm("Mismatch123!") // Mismatch
                .build();

        // Assuming passwordService.verifyOtp would handle the mismatch or a separate validation layer
        // For this test, we'll simulate the service returning false due to mismatch
        when(passwordService.verifyOtp(invalidRequest)).thenReturn(false);

        ResponseEntity<String> responseEntity = passwordController.resetPassword(invalidRequest);

        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals("Invalid or Expired OTP!", responseEntity.getBody()); // Or a more specific message if service provides it
        verify(passwordService).verifyOtp(invalidRequest);
    }
}