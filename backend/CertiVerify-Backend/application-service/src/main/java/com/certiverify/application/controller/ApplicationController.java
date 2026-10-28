package com.certiverify.application.controller;

import com.certiverify.application.dto.ApplicationRequest;
import com.certiverify.application.dto.ApplicationResponse;
import com.certiverify.application.dto.RejectRequest;
import com.certiverify.application.security.AuthenticatedUser;
import com.certiverify.application.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponse> createApplication(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.createApplication(user.getUserId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
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
