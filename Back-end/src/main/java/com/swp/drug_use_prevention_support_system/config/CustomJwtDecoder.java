package com.swp.drug_use_prevention_support_system.config;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.IntrospectRequest;
import com.swp.drug_use_prevention_support_system.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class CustomJwtDecoder implements JwtDecoder {

    private final AuthenticationService authenticationService;
    private NimbusJwtDecoder nimbusJwtDecoder;

    @Value("${jwt.secret}")
    private String secretKey;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            IntrospectRequest request = IntrospectRequest.builder().token(token).build();
            boolean isValid = authenticationService.introspect(request);
            if (!isValid) throw new JwtException("Token invalid!");
        } catch (Exception ex){
            throw new JwtException(ex.getMessage());
        }

        if (Objects.isNull(nimbusJwtDecoder)){
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HS256");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }
}
