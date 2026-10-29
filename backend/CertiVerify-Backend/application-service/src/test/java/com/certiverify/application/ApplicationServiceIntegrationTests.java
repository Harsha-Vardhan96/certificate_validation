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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

    // 17. duplicate application blocked when PENDING exists
    @Test
    void duplicatePendingApplicationBlocked() throws Exception {
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
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An application for this course is already pending review with this institution."));
    }

    // 18. duplicate application blocked when APPROVED exists
    @Test
    void duplicateApprovedApplicationBlocked() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String token = generateToken(studentId, "STUDENT");

        Application app = new Application();
        app.setStudentId(studentId);
        app.setInstitutionId(institutionId);
        app.setInstitutionName("Harvard");
        app.setCourseName("CS101");
        app.setStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(app);

        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(institutionId);
        req.setInstitutionName("Harvard");
        req.setCourseName("CS101");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An application for this course has already been approved by this institution."));
    }

    // 19. duplicate check normalizes case
    @Test
    void duplicateCheckNormalizesCase() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String token = generateToken(studentId, "STUDENT");

        Application app = new Application();
        app.setStudentId(studentId);
        app.setInstitutionId(institutionId);
        app.setInstitutionName("Harvard");
        app.setCourseName("Bachelor of Science");
        app.setStatus(ApplicationStatus.PENDING);
        applicationRepository.save(app);

        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(institutionId);
        req.setInstitutionName("Harvard");
        req.setCourseName("bachelor of science");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An application for this course is already pending review with this institution."));
    }

    // 20. duplicate check normalizes leading, trailing, and internal whitespace
    @Test
    void duplicateCheckNormalizesWhitespace() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String token = generateToken(studentId, "STUDENT");

        Application app = new Application();
        app.setStudentId(studentId);
        app.setInstitutionId(institutionId);
        app.setInstitutionName("Harvard");
        app.setCourseName("Master of Science");
        app.setStatus(ApplicationStatus.PENDING);
        applicationRepository.save(app);

        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(institutionId);
        req.setInstitutionName("Harvard");
        req.setCourseName("   Master    of     Science   ");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An application for this course is already pending review with this institution."));
    }

    // 21. reapply allowed when previous application is REJECTED
    @Test
    void reapplyAllowedWhenPreviousApplicationIsRejected() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String token = generateToken(studentId, "STUDENT");

        Application rejectedApp = new Application();
        rejectedApp.setStudentId(studentId);
        rejectedApp.setInstitutionId(institutionId);
        rejectedApp.setInstitutionName("Harvard");
        rejectedApp.setCourseName("CS101");
        rejectedApp.setStatus(ApplicationStatus.REJECTED);
        rejectedApp.setRejectionReason("Incomplete transcripts");
        rejectedApp = applicationRepository.save(rejectedApp);

        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(institutionId);
        req.setInstitutionName("Harvard");
        req.setCourseName("CS101");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Confirm both records exist and previous rejected application is preserved
        java.util.List<Application> allApps = applicationRepository.findByStudentIdAndInstitutionId(studentId, institutionId);
        org.junit.jupiter.api.Assertions.assertEquals(2, allApps.size());

        boolean hasRejected = allApps.stream().anyMatch(a -> a.getStatus() == ApplicationStatus.REJECTED && "Incomplete transcripts".equals(a.getRejectionReason()));
        boolean hasPending = allApps.stream().anyMatch(a -> a.getStatus() == ApplicationStatus.PENDING);
        org.junit.jupiter.api.Assertions.assertTrue(hasRejected);
        org.junit.jupiter.api.Assertions.assertTrue(hasPending);
    }

    // 22. same course at different institution allowed
    @Test
    void sameCourseDifferentInstitutionAllowed() throws Exception {
        Long studentId = 100L;
        String token = generateToken(studentId, "STUDENT");

        Application app = new Application();
        app.setStudentId(studentId);
        app.setInstitutionId(200L);
        app.setInstitutionName("Harvard");
        app.setCourseName("CS101");
        app.setStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(app);

        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(201L); // Different institution
        req.setInstitutionName("MIT");
        req.setCourseName("CS101");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.institutionId").value("201"))
                .andExpect(jsonPath("$.courseName").value("CS101"));
    }

    // 23. same course by different student allowed
    @Test
    void sameCourseDifferentStudentAllowed() throws Exception {
        Application app = new Application();
        app.setStudentId(100L);
        app.setInstitutionId(200L);
        app.setInstitutionName("Harvard");
        app.setCourseName("CS101");
        app.setStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(app);

        Long otherStudentId = 101L;
        String token = generateToken(otherStudentId, "STUDENT");

        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(200L);
        req.setInstitutionName("Harvard");
        req.setCourseName("CS101");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(otherStudentId.toString()))
                .andExpect(jsonPath("$.courseName").value("CS101"));
    }

    // 24. concurrent submissions for same student, institution and course prevent duplicates
    @Test
    void concurrentSubmissionsOnlyOneSucceeds() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String token = generateToken(studentId, "STUDENT");

        ApplicationRequest req = new ApplicationRequest();
        req.setInstitutionId(institutionId);
        req.setInstitutionName("Harvard");
        req.setCourseName("Distributed Systems");

        int threadCount = 4;
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(threadCount);
        java.util.concurrent.CountDownLatch readyLatch = new java.util.concurrent.CountDownLatch(threadCount);
        java.util.concurrent.CountDownLatch startLatch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.atomic.AtomicInteger successCount = new java.util.concurrent.atomic.AtomicInteger(0);
        java.util.concurrent.atomic.AtomicInteger duplicateBlockedCount = new java.util.concurrent.atomic.AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    var result = mockMvc.perform(post("/api/applications")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                            .andReturn();

                    int status = result.getResponse().getStatus();
                    if (status == 201) {
                        successCount.incrementAndGet();
                    } else if (status == 400) {
                        duplicateBlockedCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown();
        executor.shutdown();
        executor.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS);

        org.junit.jupiter.api.Assertions.assertEquals(1, successCount.get(), "Exactly one application submission must succeed");
        org.junit.jupiter.api.Assertions.assertEquals(threadCount - 1, duplicateBlockedCount.get(), "All other concurrent submissions must be blocked");

        java.util.List<Application> apps = applicationRepository.findByStudentIdAndInstitutionId(studentId, institutionId);
        org.junit.jupiter.api.Assertions.assertEquals(1, apps.size(), "Only one active application must be persisted in database");
    }

    // 25. student submits application with valid PDF
    @Test
    void studentSubmitsApplicationWithValidPdf() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String token = generateToken(studentId, "STUDENT");

        byte[] validPdfBytes = "%PDF-1.4 sample pdf content".getBytes();
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "degree_certificate.pdf", "application/pdf", validPdfBytes);

        mockMvc.perform(multipart("/api/applications")
                .file(file)
                .param("institutionId", institutionId.toString())
                .param("institutionName", "Harvard")
                .param("courseName", "Robotics")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.courseName").value("Robotics"))
                .andExpect(jsonPath("$.hasSupportingDocument").value(true))
                .andExpect(jsonPath("$.supportingDocumentName").value("degree_certificate.pdf"));
    }

    // 26. multipart submission fails when file is missing
    @Test
    void multipartSubmissionFailsWhenFileMissing() throws Exception {
        Long studentId = 100L;
        String token = generateToken(studentId, "STUDENT");

        mockMvc.perform(multipart("/api/applications")
                .param("institutionId", "200")
                .param("institutionName", "Harvard")
                .param("courseName", "Robotics")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Supporting certificate PDF is required."));
    }

    // 27. multipart submission fails with non-PDF file
    @Test
    void multipartSubmissionFailsWithNonPdf() throws Exception {
        Long studentId = 100L;
        String token = generateToken(studentId, "STUDENT");

        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "degree.txt", "text/plain", "Not a pdf file".getBytes());

        mockMvc.perform(multipart("/api/applications")
                .file(file)
                .param("institutionId", "200")
                .param("institutionName", "Harvard")
                .param("courseName", "Robotics")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only PDF files are supported."));
    }

    // 28. multipart submission fails with fake PDF bytes
    @Test
    void multipartSubmissionFailsWithFakePdfBytes() throws Exception {
        Long studentId = 100L;
        String token = generateToken(studentId, "STUDENT");

        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "malicious.pdf", "application/pdf", "FAKE_HEADER_NOT_PDF".getBytes());

        mockMvc.perform(multipart("/api/applications")
                .file(file)
                .param("institutionId", "200")
                .param("institutionName", "Harvard")
                .param("courseName", "Robotics")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid file format. The uploaded file is not a valid PDF."));
    }

    // 29. authorized student and institution can download supporting PDF
    @Test
    void authorizedStudentAndInstitutionCanDownloadSupportingPdf() throws Exception {
        Long studentId = 100L;
        Long institutionId = 200L;
        String studentToken = generateToken(studentId, "STUDENT");
        String institutionToken = generateToken(institutionId, "INSTITUTION");
        String otherStudentToken = generateToken(999L, "STUDENT");

        byte[] validPdfBytes = "%PDF-1.4 verified certificate".getBytes();
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile(
                "file", "transcript.pdf", "application/pdf", validPdfBytes);

        String responseStr = mockMvc.perform(multipart("/api/applications")
                .file(file)
                .param("institutionId", institutionId.toString())
                .param("institutionName", "Harvard")
                .param("courseName", "AI Ethics")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.JsonNode json = objectMapper.readTree(responseStr);
        long appId = json.get("applicationId").asLong();

        // 1. Student downloads own document
        mockMvc.perform(get("/api/applications/" + appId + "/document")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(content().bytes(validPdfBytes));

        // 2. Authorized institution downloads document
        mockMvc.perform(get("/api/applications/" + appId + "/document")
                .header("Authorization", "Bearer " + institutionToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(content().bytes(validPdfBytes));

        // 3. Unauthorized student blocked
        mockMvc.perform(get("/api/applications/" + appId + "/document")
                .header("Authorization", "Bearer " + otherStudentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("You are not authorized to view this document."));
    }
}
