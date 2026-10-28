package com.certiverify.auth;

import com.certiverify.auth.dto.RegisterRequest;
import com.certiverify.auth.model.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.demo-mode=true")
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthServiceDemoModeIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testDemoModeEnabled_AllowsStudentInstitutionAdminRegistration() throws Exception {
        // Test STUDENT
        RegisterRequest studentRequest = new RegisterRequest();
        studentRequest.setName("Student Demo");
        studentRequest.setEmail("student_demo@demo.com");
        studentRequest.setPassword("password123");
        studentRequest.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"));

        // Test INSTITUTION
        RegisterRequest instRequest = new RegisterRequest();
        instRequest.setName("Inst Demo");
        instRequest.setEmail("inst_demo@demo.com");
        instRequest.setPassword("password123");
        instRequest.setRole(Role.INSTITUTION);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(instRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("INSTITUTION"));

        // Test ADMIN
        RegisterRequest adminRequest = new RegisterRequest();
        adminRequest.setName("Admin Demo");
        adminRequest.setEmail("admin_demo@demo.com");
        adminRequest.setPassword("password123");
        adminRequest.setRole(Role.ADMIN);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}
