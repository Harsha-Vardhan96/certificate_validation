package com.certiverify.gateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Collections;

@Component
public class JwtAuthenticationManager implements ReactiveAuthenticationManager {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationManager(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        if (authentication == null || authentication.getCredentials() == null) {
            return Mono.empty();
        }
        String token = authentication.getCredentials().toString();

        if (jwtUtil.validateToken(token)) {
            try {
                Claims claims = jwtUtil.getClaims(token);
                String subject = claims.getSubject();
                String role = claims.get("role", String.class);
                
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        subject,
                        null,
                        role != null ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)) : Collections.emptyList()
                );
                return Mono.just(auth);
            } catch (Exception e) {
                return Mono.error(new org.springframework.security.authentication.BadCredentialsException("Invalid token"));
            }
        }

        return Mono.error(new org.springframework.security.authentication.BadCredentialsException("Invalid token"));
    }
}
