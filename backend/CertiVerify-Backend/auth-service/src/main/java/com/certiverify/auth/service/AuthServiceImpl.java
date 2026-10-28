package com.certiverify.auth.service;

import com.certiverify.auth.dto.AuthResponse;
import com.certiverify.auth.dto.LoginRequest;
import com.certiverify.auth.dto.RegisterRequest;
import com.certiverify.auth.model.Role;
import com.certiverify.auth.model.User;
import com.certiverify.auth.repository.UserRepository;
import com.certiverify.auth.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.demo-mode}")
    private boolean demoMode;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role requestedRole = request.getRole() != null ? request.getRole() : Role.STUDENT;

        if (!demoMode) {
            if (requestedRole == Role.ADMIN || requestedRole == Role.INSTITUTION) {
                throw new IllegalArgumentException("Cannot publicly register as ADMIN or INSTITUTION in normal mode");
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(requestedRole);

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUserId(), user.getName(), user.getEmail(), user.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUserId(), user.getName(), user.getEmail(), user.getRole());
    }

    @Override
    public AuthResponse registerAdminOrInstitution(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role requestedRole = request.getRole() != null ? request.getRole() : Role.INSTITUTION;

        if (requestedRole == Role.STUDENT) {
            throw new IllegalArgumentException("Please use the public registration endpoint for students");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(requestedRole);

        userRepository.save(user);

        // Don't log them in automatically when admin creates them, just return success without token or with token
        // We'll return the standard response but token could be omitted or we can return a token for them.
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUserId(), user.getName(), user.getEmail(), user.getRole());
    }
}
