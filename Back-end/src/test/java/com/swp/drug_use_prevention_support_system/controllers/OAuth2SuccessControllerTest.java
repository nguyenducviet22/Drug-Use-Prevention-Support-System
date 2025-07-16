package com.swp.drug_use_prevention_support_system.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;

import static org.junit.jupiter.api.Assertions.*;

class OAuth2SuccessControllerTest {

    @InjectMocks
    private OAuth2SuccessController oAuth2SuccessController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- 1. handleOAuth2Success tests ---
    @Test
    void testHandleOAuth2Success_ValidToken() {
        // Arrange
        String token = "some_valid_jwt_token";
        String expectedMessage = "Login successful. Token: " + token;

        // Act
        ResponseEntity<?> responseEntity = oAuth2SuccessController.handleOAuth2Success(token);

        // Assert
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedMessage, responseEntity.getBody());
    }

    @Test
    void testHandleOAuth2Success_NullToken() {
        // Arrange
        String token = null;

        // Act & Assert
        // @RequestParam("token") will throw MissingServletRequestParameterException if token is not provided at all.
        // If it's provided as an actual 'null' string, it's still treated as a value.
        // For actual null parameter, we test for the exception Spring MVC would throw.
        // If you were using MockMvc, this would be handled differently. Here, we're calling the method directly.
        // Since @RequestParam String token will automatically handle the absence of the parameter,
        // calling with 'null' as a Java object means the parameter was technically "provided" but is null.
        // If you want to simulate the parameter *not being sent*, that's harder with direct method call.
        // The most realistic "null token" scenario for @RequestParam is MissingServletRequestParameterException.
        // However, if the framework passes 'null' for some reason, the current implementation handles it.
        ResponseEntity<?> responseEntity = oAuth2SuccessController.handleOAuth2Success(token);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals("Login successful. Token: null", responseEntity.getBody());
    }

    @Test
    void testHandleOAuth2Success_EmptyToken() {
        // Arrange
        String token = "";
        String expectedMessage = "Login successful. Token: ";

        // Act
        ResponseEntity<?> responseEntity = oAuth2SuccessController.handleOAuth2Success(token);

        // Assert
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedMessage, responseEntity.getBody());
    }
}