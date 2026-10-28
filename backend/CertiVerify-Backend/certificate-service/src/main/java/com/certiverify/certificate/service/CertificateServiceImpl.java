package com.certiverify.certificate.service;

import com.certiverify.certificate.dto.CertificateIssueRequest;
import com.certiverify.certificate.dto.CertificateResponse;
import com.certiverify.certificate.model.Certificate;
import com.certiverify.certificate.model.CertificateStatus;
import com.certiverify.certificate.repository.CertificateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final HashService hashService;
    private final QrCodeService qrCodeService;
    private final PdfService pdfService;

    public CertificateServiceImpl(CertificateRepository certificateRepository,
                                  HashService hashService,
                                  QrCodeService qrCodeService,
                                  PdfService pdfService) {
        this.certificateRepository = certificateRepository;
        this.hashService = hashService;
        this.qrCodeService = qrCodeService;
        this.pdfService = pdfService;
    }

    @Override
    @Transactional
    public CertificateResponse issueCertificate(CertificateIssueRequest request, UUID authenticatedInstitutionId) {
        // Authorize institution
        if (!request.getInstitutionId().equals(authenticatedInstitutionId)) {
            throw new IllegalArgumentException("You are not authorized to issue a certificate for this institution.");
        }

        // Idempotency check: if application already has a certificate, return it
        Optional<Certificate> existing = certificateRepository.findByApplicationId(request.getApplicationId());
        if (existing.isPresent()) {
            return new CertificateResponse(existing.get());
        }

        Certificate certificate = new Certificate();
        certificate.setApplicationId(request.getApplicationId());
        certificate.setStudentId(request.getStudentId());
        certificate.setStudentName(request.getStudentName());
        certificate.setCourseName(request.getCourseName());
        certificate.setInstitutionId(request.getInstitutionId());
        certificate.setInstitutionName(request.getInstitutionName());
        
        // Let Hibernate generate the UUID first by saving it partially? No, UUID is auto-generated but we can manually generate to use it in Hash.
        UUID certId = UUID.randomUUID();
        certificate.setCertificateId(certId);
        
        String year = String.valueOf(LocalDate.now().getYear());
        String shortId = certId.toString().substring(0, 8).toUpperCase();
        certificate.setCertificateNumber("CVG-" + year + "-" + shortId);
        
        certificate.setIssueDate(LocalDate.now());
        certificate.setStatus(CertificateStatus.ISSUED);

        // Generate Hash (canonical data based on above fields)
        String hash = hashService.generateCertificateHash(certificate);
        certificate.setCertificateHash(hash);

        // Generate QR Code
        String qrData = qrCodeService.generateQrCodeData(certId);
        certificate.setQrCodeData(qrData);

        // Generate PDF
        byte[] pdfBytes = pdfService.generateCertificatePdf(certificate);
        certificate.setPdfData(pdfBytes);

        certificate = certificateRepository.save(certificate);
        return new CertificateResponse(certificate);
    }

    @Override
    public CertificateResponse getCertificateById(UUID certificateId, UUID authenticatedUserId, String role) {
        Certificate certificate = getCertificateIfAuthorized(certificateId, authenticatedUserId, role);
        return new CertificateResponse(certificate);
    }

    @Override
    public com.certiverify.certificate.dto.InternalCertificateResponse getInternalCertificateById(UUID certificateId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return new com.certiverify.certificate.dto.InternalCertificateResponse(certificate);
    }

    @Override
    public byte[] downloadCertificatePdf(UUID certificateId, UUID authenticatedUserId, String role) {
        Certificate certificate = getCertificateIfAuthorized(certificateId, authenticatedUserId, role);
        return certificate.getPdfData();
    }

    @Override
    @Transactional
    public CertificateResponse revokeCertificate(UUID certificateId, UUID authenticatedUserId, String role) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        if ("INSTITUTION".equals(role) && !certificate.getInstitutionId().equals(authenticatedUserId)) {
            throw new IllegalArgumentException("You are not authorized to revoke this certificate.");
        }

        if (certificate.getStatus() == CertificateStatus.REVOKED) {
            throw new IllegalArgumentException("Certificate is already revoked.");
        }

        certificate.setStatus(CertificateStatus.REVOKED);
        certificate = certificateRepository.save(certificate);

        return new CertificateResponse(certificate);
    }

    @Override
    public List<CertificateResponse> getStudentCertificates(UUID studentId) {
        return certificateRepository.findByStudentId(studentId).stream()
                .map(CertificateResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<CertificateResponse> getInstitutionCertificates(UUID institutionId) {
        return certificateRepository.findByInstitutionId(institutionId).stream()
                .map(CertificateResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<CertificateResponse> getAllCertificates() {
        return certificateRepository.findAll().stream()
                .map(CertificateResponse::new)
                .collect(Collectors.toList());
    }

    private Certificate getCertificateIfAuthorized(UUID certificateId, UUID authenticatedUserId, String role) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        if ("STUDENT".equals(role) && !certificate.getStudentId().equals(authenticatedUserId)) {
            throw new IllegalArgumentException("You are not authorized to view this certificate.");
        }
        if ("INSTITUTION".equals(role) && !certificate.getInstitutionId().equals(authenticatedUserId)) {
            throw new IllegalArgumentException("You are not authorized to view this certificate.");
        }

        return certificate;
    }
}
