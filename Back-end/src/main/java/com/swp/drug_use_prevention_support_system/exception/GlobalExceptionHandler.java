package com.swp.drug_use_prevention_support_system.exception;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse> handleEntityNotFoundException(EntityNotFoundException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse> handleBadCredentialsException(BadCredentialsException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException exception) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .message("You do not have permission")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.FORBIDDEN);
    }

    //Cannot get error: Password and Confirm Password do not match
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handleValidationException(MethodArgumentNotValidException exception) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(exception.getFieldError().getDefaultMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<ApiResponse> handleRuntimeException(RuntimeException exception) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message(exception.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AgeGroupMismatchException.class)
    public ResponseEntity<ApiResponse> handleAgeGroupMismatch(AgeGroupMismatchException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AlreadyRegisteredException.class)
    public ResponseEntity<ApiResponse> handleAlreadyRegistered(AlreadyRegisteredException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.CONFLICT.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EventFullException.class)
    public ResponseEntity<ApiResponse> handleEventFull(EventFullException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(CancellationNotAllowedException.class)
    public ResponseEntity<ApiResponse> handleCancellationNotAllowed(CancellationNotAllowedException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EventCancellationBlockedException.class)
    public ResponseEntity<ApiResponse> handleBlockedCancellation(EventCancellationBlockedException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidEventException.class)
    public ResponseEntity<ApiResponse> handleInvalidEventException(InvalidEventException ex) {
        ApiResponse apiResponse = ApiResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<String>> handleBadRequest(BadRequestException ex) {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .data(null)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.badRequest().body(response);
    }
}
