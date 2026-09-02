package com.certiverify.auth.security;

import com.certiverify.auth.model.Role;
import com.certiverify.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTests {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "8f2a99d45e6c7104b901a113a37b678f24b2b2b1897c414c81ab7911b69389e9");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
    }

    @Test
    void testGenerateToken() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@test.com");
        user.setRole(Role.STUDENT);

        String token = jwtService.generateToken(user);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testExtractUsername() {
        User user = new User();
        user.setUserId(2L);
        user.setEmail("test@test.com");
        user.setRole(Role.STUDENT);

        String token = jwtService.generateToken(user);
        String extractedEmail = jwtService.extractUsername(token);

        assertEquals("test@test.com", extractedEmail);
    }

    @Test
    void testTokenValidation() {
        User user = new User();
        user.setUserId(3L);
        user.setEmail("valid@test.com");
        user.setRole(Role.INSTITUTION);

        String token = jwtService.generateToken(user);

        // The token is valid for the same user
        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User("valid@test.com", "", java.util.Collections.emptyList());

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }
}
