package com.certiverify.application.service;

import com.certiverify.application.dto.ApplicationRequest;
import com.certiverify.application.dto.ApplicationResponse;
import com.certiverify.application.dto.RejectRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ApplicationService {
    ApplicationResponse createApplication(Long studentId, ApplicationRequest request);
    ApplicationResponse createApplication(Long studentId, ApplicationRequest request, MultipartFile file);
    List<ApplicationResponse> getStudentApplications(Long studentId);
    ApplicationResponse getApplicationById(Long applicationId, Long userId, String userRole);
    List<ApplicationResponse> getInstitutionApplications(Long institutionId);
    List<ApplicationResponse> getAllApplications(); // for Admin
    ApplicationResponse approveApplication(Long institutionId, Long applicationId);
    ApplicationResponse rejectApplication(Long institutionId, Long applicationId, RejectRequest request);
    byte[] getSupportingDocument(Long applicationId, Long userId, String userRole);
    String getSupportingDocumentFilename(Long applicationId);
}
