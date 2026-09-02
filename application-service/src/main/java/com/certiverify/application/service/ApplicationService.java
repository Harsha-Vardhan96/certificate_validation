package com.certiverify.application.service;

import com.certiverify.application.dto.ApplicationRequest;
import com.certiverify.application.dto.ApplicationResponse;
import com.certiverify.application.dto.RejectRequest;

import java.util.List;

import java.util.UUID;

public interface ApplicationService {
    ApplicationResponse createApplication(UUID studentId, ApplicationRequest request);
    List<ApplicationResponse> getStudentApplications(UUID studentId);
    ApplicationResponse getApplicationById(Long applicationId, UUID userId, String userRole);
    List<ApplicationResponse> getInstitutionApplications(UUID institutionId);
    List<ApplicationResponse> getAllApplications(); // for Admin
    ApplicationResponse approveApplication(UUID institutionId, Long applicationId);
    ApplicationResponse rejectApplication(UUID institutionId, Long applicationId, RejectRequest request);
}
