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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
        UserResponse userResponse = authenticationService.authenticate(request);
        String tokenValue = authenticationService.generateToken(userResponse);
        AuthenticationResponse response = AuthenticationResponse.builder()
                .token(tokenValue)
                .authenticated(true)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/introspect")
    public ResponseEntity<IntrospectResponse> introspect(@RequestBody IntrospectRequest request){
        boolean isValid = authenticationService.introspect(request);
        IntrospectResponse response = IntrospectResponse.builder()
                .valid(isValid)
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) throws Exception {
        authenticationService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        UserResponse userResponse = authenticationService.refreshToken(request);
        String tokenValue = authenticationService.generateToken(userResponse);
        AuthenticationResponse response = AuthenticationResponse.builder()
                .token(tokenValue)
                .authenticated(true)
                .build();
        return ResponseEntity.ok(response);
    }
}