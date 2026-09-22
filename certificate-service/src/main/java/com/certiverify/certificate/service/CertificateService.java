package com.certiverify.certificate.service;

import com.certiverify.certificate.dto.CertificateIssueRequest;
import com.certiverify.certificate.dto.CertificateResponse;
import com.certiverify.certificate.dto.InternalCertificateResponse;

import java.util.List;
import java.util.UUID;

public interface CertificateService {
    CertificateResponse issueCertificate(CertificateIssueRequest request, UUID authenticatedInstitutionId);
    CertificateResponse getCertificateById(UUID certificateId, UUID authenticatedUserId, String role);
    InternalCertificateResponse getInternalCertificateById(UUID certificateId);
    byte[] downloadCertificatePdf(UUID certificateId, UUID authenticatedUserId, String role);
    CertificateResponse revokeCertificate(UUID certificateId, UUID authenticatedUserId, String role);
    List<CertificateResponse> getStudentCertificates(UUID studentId);
    List<CertificateResponse> getInstitutionCertificates(UUID institutionId);
    List<CertificateResponse> getAllCertificates();
}
