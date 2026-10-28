package com.certiverify.auth.service;

import com.certiverify.auth.dto.AuthResponse;
import com.certiverify.auth.dto.LoginRequest;
import com.certiverify.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse registerAdminOrInstitution(RegisterRequest request);
}
