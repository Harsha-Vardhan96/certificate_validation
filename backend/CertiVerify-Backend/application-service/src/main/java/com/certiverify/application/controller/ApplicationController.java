package com.certiverify.application.controller;

import com.certiverify.application.dto.ApplicationRequest;
import com.certiverify.application.dto.ApplicationResponse;
import com.certiverify.application.dto.RejectRequest;
import com.certiverify.application.security.AuthenticatedUser;
import com.certiverify.application.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponse> createApplication(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.createApplication(user.getUserId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponse> createApplicationMultipart(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam("institutionId") Long institutionId,
            @RequestParam("institutionName") String institutionName,
            @RequestParam("courseName") String courseName,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "supportingDocument", required = false) MultipartFile supportingDoc) {

        MultipartFile uploadFile = file != null ? file : supportingDoc;
        if (uploadFile == null || uploadFile.isEmpty()) {
            throw new IllegalArgumentException("Supporting certificate PDF is required.");
        }

        ApplicationRequest request = new ApplicationRequest();
        request.setInstitutionId(institutionId);
        request.setInstitutionName(institutionName);
        request.setCourseName(courseName);

        ApplicationResponse response = applicationService.createApplication(user.getUserId(), request, uploadFile);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{applicationId}/document")
    public ResponseEntity<byte[]> getSupportingDocument(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("applicationId") Long applicationId) {
        byte[] pdfBytes = applicationService.getSupportingDocument(applicationId, user.getUserId(), user.getRole());
        String filename = applicationService.getSupportingDocumentFilename(applicationId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ApplicationResponse>> getStudentApplications(
            @AuthenticationPrincipal AuthenticatedUser user) {
        List<ApplicationResponse> applications = applicationService.getStudentApplications(user.getUserId());
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("applicationId") Long applicationId) {
        String role = user.getRole();
        ApplicationResponse response = applicationService.getApplicationById(applicationId, user.getUserId(), role);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/institution")
    @PreAuthorize("hasRole('INSTITUTION')")
    public ResponseEntity<List<ApplicationResponse>> getInstitutionApplications(
            @AuthenticationPrincipal AuthenticatedUser user) {
        List<ApplicationResponse> applications = applicationService.getInstitutionApplications(user.getUserId());
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{applicationId}/approve")
    @PreAuthorize("hasRole('INSTITUTION')")
    public ResponseEntity<ApplicationResponse> approveApplication(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("applicationId") Long applicationId) {
        ApplicationResponse response = applicationService.approveApplication(user.getUserId(), applicationId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{applicationId}/reject")
    @PreAuthorize("hasRole('INSTITUTION')")
    public ResponseEntity<ApplicationResponse> rejectApplication(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("applicationId") Long applicationId,
            @Valid @RequestBody RejectRequest request) {
        ApplicationResponse response = applicationService.rejectApplication(user.getUserId(), applicationId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> getAdminApplications() {
        List<ApplicationResponse> applications = applicationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }
}
