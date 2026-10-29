package com.certiverify.auth;

import com.certiverify.auth.dto.LoginRequest;
import com.certiverify.auth.dto.RegisterRequest;
import com.certiverify.auth.model.Role;
import com.certiverify.auth.model.User;
import com.certiverify.auth.repository.UserRepository;
import com.certiverify.auth.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.demo-mode=false")
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthServiceIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testSuccessfulStudentRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@student.com");
        request.setPassword("password123");
        request.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("STUDENT"));

        User user = userRepository.findByEmail("john@student.com").orElseThrow();
        assertEquals("John Doe", user.getName());
        assertTrue(passwordEncoder.matches("password123", user.getPassword()));
    }

    @Test
    void testDuplicateEmailRejection() throws Exception {
        User existingUser = new User();
        existingUser.setName("Existing");
        existingUser.setEmail("duplicate@student.com");
        existingUser.setPassword(passwordEncoder.encode("password123"));
        existingUser.setRole(Role.STUDENT);
        userRepository.save(existingUser);

        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("duplicate@student.com");
        request.setPassword("password123");
        request.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email is already registered"));
    }

    @Test
    void testDemoModeDisabledByDefault_PreventsAdminRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Admin Wannabe");
        request.setEmail("admin@wannabe.com");
        request.setPassword("password123");
        request.setRole(Role.ADMIN);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Cannot publicly register as ADMIN or INSTITUTION in normal mode"));
    }

    @Test
    void testSuccessfulLogin() throws Exception {
        User user = new User();
        user.setName("Login User");
        user.setEmail("login@student.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(Role.STUDENT);
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setEmail("login@student.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    void testIncorrectPasswordRejection() throws Exception {
        User user = new User();
        user.setName("Login User");
        user.setEmail("wrongpass@student.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(Role.STUDENT);
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setEmail("wrongpass@student.com");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void testAdminCanCreateInstitution() throws Exception {
        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail("admin@certiverify.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        String adminToken = jwtService.generateToken(admin);

        RegisterRequest request = new RegisterRequest();
        request.setName("MIT");
        request.setEmail("mit@institution.edu");
        request.setPassword("password123");
        request.setRole(Role.INSTITUTION);

        mockMvc.perform(post("/api/auth/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("INSTITUTION"));

        assertTrue(userRepository.existsByEmail("mit@institution.edu"));
    }

    @Test
    void testStudentCannotCreateInstitution() throws Exception {
        User student = new User();
        student.setName("Student User");
        student.setEmail("student@test.com");
        student.setPassword(passwordEncoder.encode("password123"));
        student.setRole(Role.STUDENT);
        userRepository.save(student);

        String studentToken = jwtService.generateToken(student);

        RegisterRequest request = new RegisterRequest();
        request.setName("MIT");
        request.setEmail("mit@institution.edu");
        request.setPassword("password123");
        request.setRole(Role.INSTITUTION);

        mockMvc.perform(post("/api/auth/admin/users")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testInstitutionCannotCreateInstitution() throws Exception {
        User institution = new User();
        institution.setName("Inst User");
        institution.setEmail("inst@test.com");
        institution.setPassword(passwordEncoder.encode("password123"));
        institution.setRole(Role.INSTITUTION);
        userRepository.save(institution);

        String instToken = jwtService.generateToken(institution);

        RegisterRequest request = new RegisterRequest();
        request.setName("MIT");
        request.setEmail("mit2@institution.edu");
        request.setPassword("password123");
        request.setRole(Role.INSTITUTION);

        mockMvc.perform(post("/api/auth/admin/users")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminCanCreateStudent() throws Exception {
        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail("admin@certiverify.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        String adminToken = jwtService.generateToken(admin);

        RegisterRequest request = new RegisterRequest();
        request.setName("Alice Student");
        request.setEmail("alice@student.edu");
        request.setPassword("password123");
        request.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.email").value("alice@student.edu"));

        User saved = userRepository.findByEmail("alice@student.edu").orElseThrow();
        assertEquals(Role.STUDENT, saved.getRole());
        assertTrue(passwordEncoder.matches("password123", saved.getPassword()));
    }

    @Test
    void testAdminCanCreateAnotherAdmin() throws Exception {
        User admin = new User();
        admin.setName("Primary Admin");
        admin.setEmail("admin@certiverify.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        String adminToken = jwtService.generateToken(admin);

        RegisterRequest request = new RegisterRequest();
        request.setName("Secondary Admin");
        request.setEmail("admin2@certiverify.com");
        request.setPassword("password123");
        request.setRole(Role.ADMIN);

        mockMvc.perform(post("/api/auth/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.email").value("admin2@certiverify.com"));

        User saved = userRepository.findByEmail("admin2@certiverify.com").orElseThrow();
        assertEquals(Role.ADMIN, saved.getRole());
    }

    @Test
    void testAdminDuplicateEmailReturnsBadRequestWithMessage() throws Exception {
        User admin = new User();
        admin.setName("Primary Admin");
        admin.setEmail("admin@certiverify.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        String adminToken = jwtService.generateToken(admin);

        // First creation succeeds
        RegisterRequest request = new RegisterRequest();
        request.setName("First Inst");
        request.setEmail("duplicate@test.com");
        request.setPassword("password123");
        request.setRole(Role.INSTITUTION);

        mockMvc.perform(post("/api/auth/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Duplicate attempt returns 400 with both error and message fields
        mockMvc.perform(post("/api/auth/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email is already registered"))
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }
}
