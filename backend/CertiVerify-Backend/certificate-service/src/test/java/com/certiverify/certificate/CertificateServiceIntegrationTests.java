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

    @Test
    void institutionIssuesCertificateSuccessfullyWithNumericIdsFromAuthService() throws Exception {
        // Simulates real-world microservices payload:
        // auth-service emits numeric userId (Long) in JWT claims
        // application-service emits numeric studentId and institutionId in request JSON
        Long instNumericId = 15L;
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", instNumericId);
        extraClaims.put("role", "INSTITUTION");
        String instToken = jwtService.generateToken(extraClaims, "klu@certiverify.com");

        String jsonPayload = """
            {
                "applicationId": 5,
                "studentId": 14,
                "studentName": "harsha",
                "courseName": "B.Tech Computer Science",
                "institutionId": 15,
                "institutionName": "KL University"
            }
            """;

        String jsonResponse = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.certificateId").exists())
                .andExpect(jsonPath("$.status").value("ISSUED"))
                .andExpect(jsonPath("$.certificateHash").exists())
                .andReturn().getResponse().getContentAsString();

        String certId = objectMapper.readTree(jsonResponse).get("certificateId").asText();

        // Student with numeric ID 14 can download their own certificate
        Map<String, Object> studentClaims = new HashMap<>();
        studentClaims.put("userId", 14L);
        studentClaims.put("role", "STUDENT");
        String studentToken = jwtService.generateToken(studentClaims, "2400030073@kluniversity.in");

        mockMvc.perform(get("/api/certificates/" + certId + "/download")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    void studentCanListOwnCertificates() throws Exception {
        UUID instId = UUID.randomUUID();
        String instToken = generateToken(instId, "INSTITUTION");
        UUID studentId = UUID.randomUUID();

        CertificateIssueRequest req = new CertificateIssueRequest();
        req.setApplicationId(101L);
        req.setStudentId(studentId);
        req.setStudentName("Alice Student");
        req.setCourseName("B.Tech Computer Science");
        req.setInstitutionId(instId);
        req.setInstitutionName("KL University");

        String json = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String certId = objectMapper.readTree(json).get("certificateId").asText();

        String studentToken = generateToken(studentId, "STUDENT");

        mockMvc.perform(get("/api/certificates/my")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].certificateId").value(certId))
                .andExpect(jsonPath("$[0].courseName").value("B.Tech Computer Science"))
                .andExpect(jsonPath("$[0].institutionName").value("KL University"))
                .andExpect(jsonPath("$[0].status").value("ISSUED"));
    }

    @Test
    void studentListingDoesNotIncludeOtherStudentsCertificates() throws Exception {
        UUID instId = UUID.randomUUID();
        String instToken = generateToken(instId, "INSTITUTION");

        UUID studentA = UUID.randomUUID();
        UUID studentB = UUID.randomUUID();

        // Issue for student A
        CertificateIssueRequest reqA = new CertificateIssueRequest();
        reqA.setApplicationId(201L);
        reqA.setStudentId(studentA);
        reqA.setStudentName("Student A");
        reqA.setCourseName("Course A");
        reqA.setInstitutionId(instId);
        reqA.setInstitutionName("Test University");

        String jsonA = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String certIdA = objectMapper.readTree(jsonA).get("certificateId").asText();

        // Issue for student B
        CertificateIssueRequest reqB = new CertificateIssueRequest();
        reqB.setApplicationId(202L);
        reqB.setStudentId(studentB);
        reqB.setStudentName("Student B");
        reqB.setCourseName("Course B");
        reqB.setInstitutionId(instId);
        reqB.setInstitutionName("Test University");

        mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqB)))
                .andExpect(status().isCreated());

        // Student A lists certificates - must only see their own
        String tokenA = generateToken(studentA, "STUDENT");
        mockMvc.perform(get("/api/certificates/my")
                .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].certificateId").value(certIdA))
                .andExpect(jsonPath("$[0].courseName").value("Course A"));

        // A third student with no certificates receives an empty array
        UUID studentC = UUID.randomUUID();
        String tokenC = generateToken(studentC, "STUDENT");
        mockMvc.perform(get("/api/certificates/my")
                .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void studentCanListCertificatesWithNumericUserIdInToken() throws Exception {
        Long instNumericId = 15L;
        Map<String, Object> instClaims = new HashMap<>();
        instClaims.put("userId", instNumericId);
        instClaims.put("role", "INSTITUTION");
        String instToken = jwtService.generateToken(instClaims, "klu@certiverify.com");

        String jsonPayload = """
            {
                "applicationId": 301,
                "studentId": 14,
                "studentName": "harsha",
                "courseName": "B.Tech Computer Science",
                "institutionId": 15,
                "institutionName": "KL University"
            }
            """;

        String jsonResponse = mockMvc.perform(post("/api/certificates/issue")
                .header("Authorization", "Bearer " + instToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String certId = objectMapper.readTree(jsonResponse).get("certificateId").asText();

        // Student with numeric ID 14 in JWT
        Map<String, Object> studentClaims = new HashMap<>();
        studentClaims.put("userId", 14L);
        studentClaims.put("role", "STUDENT");
        String studentToken = jwtService.generateToken(studentClaims, "2400030073@kluniversity.in");

        mockMvc.perform(get("/api/certificates/my")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].certificateId").value(certId))
                .andExpect(jsonPath("$[0].courseName").value("B.Tech Computer Science"))
                .andExpect(jsonPath("$[0].institutionName").value("KL University"))
                .andExpect(jsonPath("$[0].certificateNumber").exists());
    }

    @Test
    void nonStudentCannotAccessMyCertificatesEndpoint() throws Exception {
        UUID instId = UUID.randomUUID();
        String instToken = generateToken(instId, "INSTITUTION");

        mockMvc.perform(get("/api/certificates/my")
                .header("Authorization", "Bearer " + instToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedUserCannotAccessMyCertificatesEndpoint() throws Exception {
        mockMvc.perform(get("/api/certificates/my"))
                .andExpect(status().isForbidden());
    }
}
