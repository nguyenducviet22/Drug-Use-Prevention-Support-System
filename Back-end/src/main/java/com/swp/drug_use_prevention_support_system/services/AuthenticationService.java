package com.swp.drug_use_prevention_support_system.services;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.AuthenticationRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.IntrospectRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.LogoutRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.RefreshRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.InvalidatedToken;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.domain.enums.UserStatus;
import com.swp.drug_use_prevention_support_system.mappers.UserMapper;
import com.swp.drug_use_prevention_support_system.repositories.InvalidatedTokenRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.valid-duration}")
    private Long jwtExpiryMs;

    @Value("${jwt.refreshable-duration}")
    private Long jwtRefresh;

    public UserResponse authenticate(AuthenticationRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Incorrect username or password!"));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) throw new BadCredentialsException("Incorrect username or password!");
        return userMapper.toDto(user);
    }

    public String generateToken(UserResponse userResponse) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(userResponse.getUsername())
                .issuer(issuer)
                .issueTime(new Date(System.currentTimeMillis()))
                .expirationTime(new Date(System.currentTimeMillis() + jwtExpiryMs))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", userResponse.getRole())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secretKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token!", e);
            throw new RuntimeException(e);
        }
    }

    public boolean introspect(IntrospectRequest request) {
        boolean isValid = true;
        try {
            verifyToken(request.getToken(), false);
        } catch (Exception ex) {
            isValid = false;
        }
        return isValid;
    }

    public void logout(LogoutRequest request) throws Exception {
        try {
            SignedJWT signedJWT = verifyToken(request.getToken(), true);
            String jit = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jit)
                    .expiryTime(expiryTime)
                    .build();
            invalidatedTokenRepository.save(invalidatedToken);
        } catch (Exception ex) {
            log.warn("Failed to logout user. Reason: {}", ex.getMessage());
        }
    }

    public UserResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = verifyToken(request.getToken(), true);
        String jit = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();
        invalidatedTokenRepository.save(invalidatedToken);

        String username = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User does not exist with username: " + username));
        return userMapper.toDto(user);
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(secretKey.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        boolean verified = signedJWT.verify(verifier);
        if (!verified) throw new JwtException("Invalid JWT signature!");

        Date expiryTime = (isRefresh) ?
                new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                        .toInstant().plus(jwtRefresh, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();
        if (expiryTime.before(new Date(System.currentTimeMillis())))
            throw new JwtException("Token expired!");

        String jit = signedJWT.getJWTClaimsSet().getJWTID();
        if (invalidatedTokenRepository.existsById(jit))
            throw new JwtException("Token already invalidated!");

        return signedJWT;
    }

    public UserResponse findOrCreateUserFromGoogle(String email, String name) {
        Optional<User> existing = userRepository.findByUsername(email);
        if (existing.isPresent()) {
            return userMapper.toDto(existing.get());
        }

        User newUser = new User();
        newUser.setUsername(email);
        newUser.setEmail(email);
        newUser.setFullName(name);
        newUser.setPassword("");
        newUser.setStatus(UserStatus.ACTIVE);
        newUser.setRole(Role.MEMBER);
        userRepository.save(newUser);
        return userMapper.toDto(newUser);
    }

    public UserDetails validateToken(String token) {
        try {
            SignedJWT signedJWT = verifyToken(token, false);
            String username = signedJWT.getJWTClaimsSet().getSubject();
            return userDetailsService.loadUserByUsername(username);
        } catch (Exception e) {
            throw new JwtException("Invalid token!", e);
        }
    }
}
