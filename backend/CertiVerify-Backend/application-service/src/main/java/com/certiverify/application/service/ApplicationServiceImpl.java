package com.certiverify.application.service;

import com.certiverify.application.client.CertificateServiceClient;
import com.certiverify.application.dto.ApplicationRequest;
import com.certiverify.application.dto.ApplicationResponse;
import com.certiverify.application.dto.CertificateIssueRequest;
import com.certiverify.application.exception.DuplicateApplicationException;
import com.certiverify.application.exception.ResourceNotFoundException;
import com.certiverify.application.model.Application;
import com.certiverify.application.model.ApplicationStatus;
import com.certiverify.application.repository.ApplicationRepository;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CertificateServiceClient certificateServiceClient;
    private final TransactionTemplate transactionTemplate;

    @Value("${app.upload.dir:uploads/supporting-documents}")
    private String uploadDir = "uploads/supporting-documents";

    private static final int STRIPE_COUNT = 256;
    private final Object[] stripes = new Object[STRIPE_COUNT];
    {
        for (int i = 0; i < STRIPE_COUNT; i++) {
            stripes[i] = new Object();
        }
    }

    private Object getStripe(String key) {
        return stripes[(key.hashCode() & 0x7FFFFFFF) % STRIPE_COUNT];
    }

    @Autowired
    public ApplicationServiceImpl(
            ApplicationRepository applicationRepository,
            CertificateServiceClient certificateServiceClient,
            PlatformTransactionManager transactionManager) {
        this.applicationRepository = applicationRepository;
        this.certificateServiceClient = certificateServiceClient;
        this.transactionTemplate = transactionManager != null ? new TransactionTemplate(transactionManager) : null;
    }

    public ApplicationServiceImpl(
            ApplicationRepository applicationRepository,
            CertificateServiceClient certificateServiceClient) {
        this(applicationRepository, certificateServiceClient, null);
    }

    public static String normalizeCourseName(String courseName) {
        if (courseName == null) {
            return "";
        }
        return courseName.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    @Override
    public ApplicationResponse createApplication(
            Long studentId, ApplicationRequest request) {
        return createApplication(studentId, request, null);
    }

    @Override
    public ApplicationResponse createApplication(
            Long studentId, ApplicationRequest request, MultipartFile file) {

        String normalizedCourse = normalizeCourseName(request.getCourseName());
        if (normalizedCourse.isEmpty()) {
            throw new IllegalArgumentException("Course name is required.");
        }
        if (request.getInstitutionId() == null) {
            throw new IllegalArgumentException("Institution ID is required.");
        }

        if (file != null && !file.isEmpty()) {
            validatePdfFile(file);
        }

        String lockKey = studentId + ":" + request.getInstitutionId() + ":" + normalizedCourse;
        Object stripe = getStripe(lockKey);

        synchronized (stripe) {
            if (transactionTemplate != null) {
                return transactionTemplate.execute(status -> createApplicationInternal(studentId, request, normalizedCourse, file));
            } else {
                return createApplicationInternal(studentId, request, normalizedCourse, file);
            }
        }
    }

    private void validatePdfFile(MultipartFile file) {
        long maxSize = 10 * 1024 * 1024; // 10 MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 10 MB.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are supported.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.equalsIgnoreCase("application/pdf")
                && !contentType.equalsIgnoreCase("application/x-pdf")
                && !contentType.equalsIgnoreCase("application/octet-stream")) {
            throw new IllegalArgumentException("Only PDF files are supported.");
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length < 4 || bytes[0] != '%' || bytes[1] != 'P' || bytes[2] != 'D' || bytes[3] != 'F') {
                throw new IllegalArgumentException("Invalid file format. The uploaded file is not a valid PDF.");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read uploaded file: " + e.getMessage());
        }
    }

    private ApplicationResponse createApplicationInternal(
            Long studentId, ApplicationRequest request, String normalizedCourse, MultipartFile file) {

        List<Application> existingApplications = applicationRepository.findByStudentIdAndInstitutionId(
                studentId, request.getInstitutionId());

        boolean hasPending = false;
        boolean hasApproved = false;

        for (Application existing : existingApplications) {
            String existingNormalized = normalizeCourseName(existing.getCourseName());
            if (existingNormalized.equals(normalizedCourse)) {
                if (existing.getStatus() == ApplicationStatus.PENDING) {
                    hasPending = true;
                } else if (existing.getStatus() == ApplicationStatus.APPROVED) {
                    hasApproved = true;
                }
            }
        }

        if (hasPending) {
            throw new DuplicateApplicationException(
                    "An application for this course is already pending review with this institution.");
        }

        if (hasApproved) {
            throw new DuplicateApplicationException(
                    "An application for this course has already been approved by this institution.");
        }

        Application application = new Application();
        application.setStudentId(studentId);
        application.setInstitutionId(request.getInstitutionId());
        application.setInstitutionName(request.getInstitutionName() != null ? request.getInstitutionName().trim() : null);
        application.setCourseName(request.getCourseName() != null ? request.getCourseName().trim() : null);
        application.setStatus(ApplicationStatus.PENDING);

        if (file != null && !file.isEmpty()) {
            try {
                Path uploadDirPath = Paths.get(uploadDir);
                if (!Files.exists(uploadDirPath)) {
                    Files.createDirectories(uploadDirPath);
                }

                String originalFilename = file.getOriginalFilename();
                String sanitized = originalFilename != null
                        ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_")
                        : "document.pdf";
                String uniqueFilename = "app_" + studentId + "_" + UUID.randomUUID() + "_" + sanitized;
                Path targetPath = uploadDirPath.resolve(uniqueFilename).normalize();

                if (!targetPath.startsWith(uploadDirPath.normalize())) {
                    throw new IllegalArgumentException("Invalid file path.");
                }

                byte[] fileBytes = file.getBytes();
                Files.write(targetPath, fileBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

                application.setSupportingDocumentName(originalFilename != null ? originalFilename : sanitized);
                application.setSupportingDocumentPath(targetPath.toString());
                application.setSupportingDocumentData(fileBytes);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store supporting document: " + e.getMessage(), e);
            }
        }

        application = applicationRepository.save(application);

        return new ApplicationResponse(application);
    }

    @Override
    public List<ApplicationResponse> getStudentApplications(Long studentId) {
        return applicationRepository.findByStudentId(studentId)
                .stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public ApplicationResponse getApplicationById(
            Long applicationId, Long userId, String userRole) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Application not found"));

        if ("STUDENT".equals(userRole)
                && !application.getStudentId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to view this application.");
        }

        if ("INSTITUTION".equals(userRole)
                && !application.getInstitutionId().equals(userId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to view this application.");
        }

        return new ApplicationResponse(application);
    }

    @Override
    public List<ApplicationResponse> getInstitutionApplications(Long institutionId) {
        return applicationRepository.findByInstitutionId(institutionId)
                .stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll()
                .stream()
                .map(ApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApplicationResponse approveApplication(
            Long institutionId, Long applicationId) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Application not found"));

        if (!application.getInstitutionId().equals(institutionId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to approve this application.");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot approve. Application is already "
                            + application.getStatus());
        }

        // Prepare certificate request
        CertificateIssueRequest certReq = new CertificateIssueRequest();
        certReq.setApplicationId(application.getApplicationId());
        certReq.setStudentId(application.getStudentId());
        certReq.setStudentName("Student Name");
        certReq.setCourseName(application.getCourseName());
        certReq.setInstitutionId(application.getInstitutionId());
        certReq.setInstitutionName(application.getInstitutionName());

        // Issue the certificate via Feign (Authorization header is automatically propagated by FeignClientInterceptor)
        try {
            certificateServiceClient.issueCertificate(certReq);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to issue certificate: " + e.getMessage(), e);
        }

        // Mark application approved only after certificate issuance succeeds
        application.setStatus(ApplicationStatus.APPROVED);
        application.setRejectionReason(null);
        application = applicationRepository.save(application);

        return new ApplicationResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse rejectApplication(
            Long institutionId,
            Long applicationId,
            com.certiverify.application.dto.RejectRequest request) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Application not found"));

        if (!application.getInstitutionId().equals(institutionId)) {
            throw new IllegalArgumentException(
                    "You are not authorized to reject this application.");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot reject. Application is already "
                            + application.getStatus());
        }

        if (request.getRejectionReason() == null
                || request.getRejectionReason().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Rejection reason is required.");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(request.getRejectionReason());
        application = applicationRepository.save(application);

        return new ApplicationResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getSupportingDocument(Long applicationId, Long userId, String userRole) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if ("STUDENT".equals(userRole) && !application.getStudentId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to view this document.");
        }

        if ("INSTITUTION".equals(userRole) && !application.getInstitutionId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to view this document.");
        }

        if (application.getSupportingDocumentPath() != null) {
            Path path = Paths.get(application.getSupportingDocumentPath());
            if (Files.exists(path)) {
                try {
                    return Files.readAllBytes(path);
                } catch (IOException e) {
                    // Fall back to database
                }
            }
        }

        if (application.getSupportingDocumentData() != null) {
            return application.getSupportingDocumentData();
        }

        throw new ResourceNotFoundException("No supporting document found for this application.");
    }

    @Override
    @Transactional(readOnly = true)
    public String getSupportingDocumentFilename(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        return application.getSupportingDocumentName() != null
                ? application.getSupportingDocumentName()
                : "supporting-document-" + applicationId + ".pdf";
    }
}
