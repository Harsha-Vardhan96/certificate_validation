package com.certiverify.certificate;

import com.certiverify.certificate.dto.CertificateIssueRequest;
import com.certiverify.certificate.model.CertificateStatus;
import com.certiverify.certificate.repository.CertificateRepository;
import com.certiverify.certificate.security.JwtService;
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
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CertificateServiceIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        certificateRepository.deleteAll();
    }

    private String generateToken(UUID userId, String role) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", userId.toString());
        extraClaims.put("role", role);
        return jwtService.generateToken(extraClaims, userId + "@test.com");
    }

    @Test
    void institutionIssuesCertificateSuccessfully() throws Exception {
        UUID instId = UUID.randomUUID();
        String token = generateToken(instId, "INSTITUTION");

        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(1L);
        req.setStudentId(UUID.randomUUID());
        req.setStudentName("John Doe");
        req.setCourseName("Computer Science");
        req.setInstitutionId(instId);
        req.setInstitutionName("Stanford");

        mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.certificateId").exists())
                .andExpect(jsonPath("$.certificateNumber").exists())
                .andExpect(jsonPath("$.status").value("ISSUED"))
                .andExpect(jsonPath("$.certificateHash").exists())
                .andExpect(jsonPath("$.qrCodeData").exists())
                .andExpect(jsonPath("$.pdfData").doesNotExist());
    }

    @Test
    void unauthenticatedIssuanceRejected() throws Exception {
        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(1L);
        req.setStudentId(UUID.randomUUID());
        req.setStudentName("John Doe");
        req.setCourseName("Computer Science");
        req.setInstitutionId(UUID.randomUUID());
        req.setInstitutionName("Stanford");

        mockMvc.perform(post("/api/certificates/issue")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void institutionCannotIssueForAnotherInstitution() throws Exception {
        UUID maliciousInstId = UUID.randomUUID();
        String token = generateToken(maliciousInstId, "INSTITUTION");

        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(1L);
        req.setStudentId(UUID.randomUUID());
        req.setStudentName("John Doe");
        req.setCourseName("Computer Science");
        req.setInstitutionId(UUID.randomUUID()); // Target is different from maliciousInstId
        req.setInstitutionName("Stanford");

        mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest()); // IllegalArgumentException -> 400
    }

    @Test
    void duplicateIssuanceReturnsExistingCertificate() throws Exception {
        UUID instId = UUID.randomUUID();
        String token = generateToken(instId, "INSTITUTION");

        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(2L);
        req.setStudentId(UUID.randomUUID());
        req.setStudentName("Jane Doe");
        req.setCourseName("Mathematics");
        req.setInstitutionId(instId);
        req.setInstitutionName("MIT");

        // Issue first time
        String response1 = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Issue second time (Idempotency)
        String response2 = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Assert they have the same ID
        String id1 = objectMapper.readTree(response1).get("certificateId").asText();
        String id2 = objectMapper.readTree(response2).get("certificateId").asText();
        assertEquals(id1, id2, "Duplicate issuance should return the exact same certificate ID");
        
        // Assert only one exists in DB
        assertEquals(1, certificateRepository.count());
    }

    @Test
    void studentCanDownloadOwnCertificate() throws Exception {
        // Setup via institution
        UUID instId = UUID.randomUUID();
        String instToken = generateToken(instId, "INSTITUTION");
        UUID studentId = UUID.randomUUID();

        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(3L);
        req.setStudentId(studentId);
        req.setStudentName("Alice");
        req.setCourseName("Physics");
        req.setInstitutionId(instId);
        req.setInstitutionName("Caltech");

        String json = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andReturn().getResponse().getContentAsString();
                
        String certId = objectMapper.readTree(json).get("certificateId").asText();

        // Test download as student
        String studentToken = generateToken(studentId, "STUDENT");
        
        mockMvc.perform(get("/api/certificates/" + certId + "/download")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void studentCannotDownloadAnotherStudentsCertificate() throws Exception {
        UUID instId = UUID.randomUUID();
        String instToken = generateToken(instId, "INSTITUTION");

        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(4L);
        req.setStudentId(UUID.randomUUID());
        req.setStudentName("Bob");
        req.setCourseName("Chemistry");
        req.setInstitutionId(instId);
        req.setInstitutionName("Oxford");

        String json = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andReturn().getResponse().getContentAsString();
                
        String certId = objectMapper.readTree(json).get("certificateId").asText();

        // Test download as malicious student
        String maliciousStudentToken = generateToken(UUID.randomUUID(), "STUDENT");
        
        mockMvc.perform(get("/api/certificates/" + certId + "/download")
                .header("Authorization", "Bearer " + maliciousStudentToken))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void institutionCanRevokeOwnCertificate() throws Exception {
        UUID instId = UUID.randomUUID();
        String instToken = generateToken(instId, "INSTITUTION");

        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(5L);
        req.setStudentId(UUID.randomUUID());
        req.setStudentName("Charlie");
        req.setCourseName("Biology");
        req.setInstitutionId(instId);
        req.setInstitutionName("Cambridge");

        String json = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andReturn().getResponse().getContentAsString();
                
        String certId = objectMapper.readTree(json).get("certificateId").asText();

        mockMvc.perform(put("/api/certificates/" + certId + "/revoke")
                .header("Authorization", "Bearer " + instToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVOKED"));
    }
}
