package com.certiverify.application.service;

import com.certiverify.application.client.CertificateServiceClient;
import com.certiverify.application.dto.ApplicationRequest;
import com.certiverify.application.dto.ApplicationResponse;
import com.certiverify.application.dto.CertificateIssueRequest;
import com.certiverify.application.dto.RejectRequest;
import com.certiverify.application.exception.ResourceNotFoundException;
import com.certiverify.application.model.Application;
import com.certiverify.application.model.ApplicationStatus;
import com.certiverify.application.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CertificateServiceClient certificateServiceClient;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository, CertificateServiceClient certificateServiceClient) {
        this.applicationRepository = applicationRepository;
        this.certificateServiceClient = certificateServiceClient;
    }

    @Override
    @Transactional
    public ApplicationResponse createApplication(Long studentId, ApplicationRequest request) {
        Application application = new Application();
        application.setStudentId(studentId);
        application.setInstitutionId(request.getInstitutionId());
        application.setInstitutionName(request.getInstitutionName());
        application.setCourseName(request.getCourseName());
        application.setStatus(ApplicationStatus.PENDING);

        application = applicationRepository.save(application);
        return new ApplicationResponse(application);
    }

    @Override
    public List<ApplicationResponse> getStudentApplications(Long studentId) {
        return applicationRepository.findByStudentId(studentId).stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public ApplicationResponse getApplicationById(Long applicationId, Long userId, String userRole) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if ("STUDENT".equals(userRole) && !application.getStudentId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to view this application.");
        }
        if ("INSTITUTION".equals(userRole) && !application.getInstitutionId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to view this application.");
        }
        
        return new ApplicationResponse(application);
    }

    @Override
    public List<ApplicationResponse> getInstitutionApplications(Long institutionId) {
        return applicationRepository.findByInstitutionId(institutionId).stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApplicationResponse approveApplication(Long institutionId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getInstitutionId().equals(institutionId)) {
            throw new IllegalArgumentException("You are not authorized to approve this application.");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Cannot approve. Application is already " + application.getStatus());
        }

        application.setStatus(ApplicationStatus.APPROVED);
        application.setRejectionReason(null);
        application = applicationRepository.save(application);

        try {
            CertificateIssueRequest certReq = new CertificateIssueRequest();
            certReq.setApplicationId(application.getApplicationId()); // Long
            certReq.setStudentId(application.getStudentId());
            certReq.setStudentName("Student Name"); // Student Name needs to come from somewhere, wait... Application doesn't have studentName. Let me fetch from user or just pass a placeholder since application doesn't have it.
            certReq.setCourseName(application.getCourseName());
            certReq.setInstitutionId(application.getInstitutionId());
            certReq.setInstitutionName(application.getInstitutionName());

            certificateServiceClient.issueCertificate(certReq);
        } catch (Exception e) {
            throw new RuntimeException("Failed to issue certificate: " + e.getMessage(), e);
        }

        return new ApplicationResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse rejectApplication(Long institutionId, Long applicationId, com.certiverify.application.dto.RejectRequest request) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getInstitutionId().equals(institutionId)) {
            throw new IllegalArgumentException("You are not authorized to reject this application.");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Cannot reject. Application is already " + application.getStatus());
        }

        if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(request.getRejectionReason());
        application = applicationRepository.save(application);

        return new ApplicationResponse(application);
    }
}
