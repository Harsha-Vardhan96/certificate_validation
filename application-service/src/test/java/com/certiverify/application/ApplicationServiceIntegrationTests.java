package com.certiverify.application;

import com.certiverify.application.dto.ApplicationRequest;
import com.certiverify.application.dto.RejectRequest;
import com.certiverify.application.model.Application;
import com.certiverify.application.model.ApplicationStatus;
import com.certiverify.application.repository.ApplicationRepository;
import com.certiverify.application.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ApplicationServiceIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JwtService jwtService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.certiverify.application.client.CertificateServiceClient certificateServiceClient;

    @BeforeEach
    void setUp() {
        applicationRepository.deleteAll();
    }

    private String generateToken(Long userId, String role) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", userId.toString());
        extraClaims.put("role", role);
        return jwtService.generateToken(extraClaims, userId + "@test.com");
    }

    // 1. student creates application
    @Test
    void studentCreatesApplication() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String token = generateToken(studentId, "STUDENT");
        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(institutionId);
        req.setInstitutionName("Harvard");
        req.setCourseName("CS101");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.institutionId").value(institutionId.toString()))
                .andExpect(jsonPath("$.courseName").value("CS101"));
    }

    // 2. unauthenticated creation rejected
    @Test
    void unauthenticatedCreationRejected() throws Exception {
        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(200L);
        req.setInstitutionName("Harvard");
        req.setCourseName("CS101");

        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // 3. institution cannot create student application
    @Test
    void institutionCannotCreateStudentApplication() throws Exception {
        Long institutionId = 200L;
        String token = generateToken(institutionId, "INSTITUTION");
        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(institutionId);
        req.setInstitutionName("Harvard");
        req.setCourseName("CS101");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // 4. application starts PENDING
    @Test
    void applicationStartsPending() throws Exception {
        Long studentId = 100L;
        String token = generateToken(studentId, "STUDENT");
        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(200L);
        req.setInstitutionName("MIT");
        req.setCourseName("Physics");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    // 5. student sees own applications
    @Test
    void studentSeesOwnApplications() throws Exception {
        Long studentId = 100L;
        String token = generateToken(studentId, "STUDENT");
        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(200L);
        req.setInstitutionName("Stanford");
        req.setCourseName("Math");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));

        mockMvc.perform(get("/api/applications/my")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // 6. student cannot see another student's application
    @Test
    void studentCannotSeeAnotherStudentsApplication() throws Exception {
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(200L);
        app.setInstitutionName("Yale");
        app.setCourseName("History");
        app.setStatus(ApplicationStatus.PENDING);
        app = applicationRepository.save(app);

        Long otherStudentId = 101L;
        String token = generateToken(otherStudentId, "STUDENT");

        mockMvc.perform(get("/api/applications/" + app.getApplicationId())
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest()); 
    }

    // 7. institution sees authorized applications
    @Test
    void institutionSeesAuthorizedApplications() throws Exception {
        Long instId = 201L;
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(instId);
        app.setInstitutionName("UCLA");
        app.setCourseName("Art");
        app.setStatus(ApplicationStatus.PENDING);
        applicationRepository.save(app);

        String token = generateToken(instId, "INSTITUTION");

        mockMvc.perform(get("/api/applications/institution")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // 8. institution approves PENDING application
    @Test
    void institutionApprovesPendingApplication() throws Exception {
        Long instId = 201L;
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(instId);
        app.setInstitutionName("NYU");
        app.setCourseName("Film");
        app.setStatus(ApplicationStatus.PENDING);
        app = applicationRepository.save(app);

        String token = generateToken(instId, "INSTITUTION");

        mockMvc.perform(put("/api/applications/" + app.getApplicationId() + "/approve")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    // 9. institution rejects PENDING application
    @Test
    void institutionRejectsPendingApplication() throws Exception {
        Long instId = 201L;
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(instId);
        app.setInstitutionName("USC");
        app.setCourseName("Music");
        app.setStatus(ApplicationStatus.PENDING);
        app = applicationRepository.save(app);

        String token = generateToken(instId, "INSTITUTION");
        RejectRequest req = new RejectRequest();
        req.setRejectionReason("Incomplete");

        mockMvc.perform(put("/api/applications/" + app.getApplicationId() + "/reject")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Incomplete"));
    }

    // 10. rejection requires reason
    @Test
    void rejectionRequiresReason() throws Exception {
        Long instId = 201L;
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(instId);
        app.setInstitutionName("Brown");
        app.setCourseName("Chem");
        app.setStatus(ApplicationStatus.PENDING);
        app = applicationRepository.save(app);

        String token = generateToken(instId, "INSTITUTION");
        RejectRequest req = new RejectRequest();
        req.setRejectionReason("");

        mockMvc.perform(put("/api/applications/" + app.getApplicationId() + "/reject")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // 11. approved cannot be approved again
    @Test
    void approvedCannotBeApprovedAgain() throws Exception {
        Long instId = 201L;
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(instId);
        app.setInstitutionName("Columbia");
        app.setCourseName("Law");
        app.setStatus(ApplicationStatus.APPROVED);
        app = applicationRepository.save(app);

        String token = generateToken(instId, "INSTITUTION");

        mockMvc.perform(put("/api/applications/" + app.getApplicationId() + "/approve")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    // 12. approved cannot be rejected
    @Test
    void approvedCannotBeRejected() throws Exception {
        Long instId = 201L;
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(instId);
        app.setInstitutionName("Columbia");
        app.setCourseName("Law");
        app.setStatus(ApplicationStatus.APPROVED);
        app = applicationRepository.save(app);

        String token = generateToken(instId, "INSTITUTION");
        RejectRequest req = new RejectRequest();
        req.setRejectionReason("Changed mind");

        mockMvc.perform(put("/api/applications/" + app.getApplicationId() + "/reject")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // 13. rejected cannot be approved
    @Test
    void rejectedCannotBeApproved() throws Exception {
        Long instId = 201L;
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(instId);
        app.setInstitutionName("Columbia");
        app.setCourseName("Law");
        app.setStatus(ApplicationStatus.REJECTED);
        app = applicationRepository.save(app);

        String token = generateToken(instId, "INSTITUTION");

        mockMvc.perform(put("/api/applications/" + app.getApplicationId() + "/approve")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    // 14. unauthorized institution cannot modify another institution's application
    @Test
    void unauthorizedInstitutionCannotModifyAnotherInstitutionsApplication() throws Exception {
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(200L);
        app.setInstitutionName("Columbia");
        app.setCourseName("Law");
        app.setStatus(ApplicationStatus.PENDING);
        app = applicationRepository.save(app);

        String token = generateToken(999L, "INSTITUTION");

        mockMvc.perform(put("/api/applications/" + app.getApplicationId() + "/approve")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    // 15. admin can view applications
    @Test
    void adminCanViewApplications() throws Exception {
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(200L);
        app.setInstitutionName("Columbia");
        app.setCourseName("Law");
        app.setStatus(ApplicationStatus.PENDING);
        applicationRepository.save(app);

        String token = generateToken(999L, "ADMIN");

        mockMvc.perform(get("/api/applications/admin")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // 16. validation errors
    @Test
    void validationErrors() throws Exception {
        String token = generateToken(999L, "STUDENT");
        ApplicationRequest req = new ApplicationRequest();

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
