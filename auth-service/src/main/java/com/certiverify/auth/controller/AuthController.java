package com.certiverify.auth.controller;

import com.certiverify.auth.dto.AuthResponse;
import com.certiverify.auth.dto.LoginRequest;
import com.certiverify.auth.dto.RegisterRequest;
import com.certiverify.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createInstitutionOrAdmin(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerAdminOrInstitution(request));
    }
}
