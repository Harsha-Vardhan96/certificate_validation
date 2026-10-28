package com.certiverify.verification.service;

import com.certiverify.verification.client.CertificateClient;
import com.certiverify.verification.dto.InternalCertificateResponse;
import com.certiverify.verification.dto.VerificationResponse;
import com.certiverify.verification.exception.CertificateNotFoundException;
import com.certiverify.verification.exception.ServiceUnavailableException;
import com.certiverify.verification.model.Verification;
import com.certiverify.verification.model.VerificationStatus;
import com.certiverify.verification.repository.VerificationRepository;
import feign.FeignException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class VerificationServiceImpl implements VerificationService {

    private final CertificateClient certificateClient;
    private final HashVerificationService hashVerificationService;
    private final VerificationRepository verificationRepository;

    public VerificationServiceImpl(CertificateClient certificateClient,
                                   HashVerificationService hashVerificationService,
                                   VerificationRepository verificationRepository) {
        this.certificateClient = certificateClient;
        this.hashVerificationService = hashVerificationService;
        this.verificationRepository = verificationRepository;
    }

    @Override
    public VerificationResponse verifyCertificate(UUID certificateId) {
        InternalCertificateResponse certResponse;
        
        try {
            certResponse = certificateClient.getInternalCertificateById(certificateId);
        } catch (FeignException.NotFound e) {
            return handleInvalidCertificate(certificateId);
        } catch (FeignException.ServiceUnavailable e) {
            throw new ServiceUnavailableException("Certificate service is currently unavailable. Please try again later.");
        } catch (FeignException e) {
            throw new ServiceUnavailableException("Unable to contact certificate service.");
        }

        if (certResponse == null) {
            return handleInvalidCertificate(certificateId);
        }

        if ("REVOKED".equals(certResponse.getStatus())) {
            return logAndReturnVerification(certResponse, VerificationStatus.REVOKED, "Certificate has been officially revoked.");
        }

        boolean hashMatches = hashVerificationService.verifyHash(certResponse, certResponse.getCertificateHash());

        if (hashMatches) {
            return logAndReturnVerification(certResponse, VerificationStatus.VALID, "Certificate is valid and authenticity is cryptographically verified.");
        } else {
            return logAndReturnVerification(certResponse, VerificationStatus.TAMPERED, "Certificate exists but its integrity hash does not match. It may have been tampered with.");
        }
    }

    private VerificationResponse handleInvalidCertificate(UUID certificateId) {
        Verification verification = new Verification();
        verification.setCertificateId(certificateId);
        verification.setVerificationStatus(VerificationStatus.INVALID);
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setMessage("Certificate not found or invalid.");
        
        verification = verificationRepository.save(verification);

        VerificationResponse response = new VerificationResponse();
        response.setVerificationId(verification.getVerificationId());
        response.setCertificateId(certificateId);
        response.setVerificationStatus(VerificationStatus.INVALID);
        response.setVerifiedAt(verification.getVerifiedAt());
        response.setMessage(verification.getMessage());
        return response;
    }

    private VerificationResponse logAndReturnVerification(InternalCertificateResponse cert, VerificationStatus status, String message) {
        Verification verification = new Verification();
        verification.setCertificateId(cert.getCertificateId());
        verification.setCertificateNumber(cert.getCertificateNumber());
        verification.setCertificateStatus(cert.getStatus());
        verification.setVerificationStatus(status);
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setMessage(message);
        
        verification = verificationRepository.save(verification);

        VerificationResponse response = new VerificationResponse();
        response.setVerificationId(verification.getVerificationId());
        response.setCertificateId(cert.getCertificateId());
        response.setCertificateNumber(cert.getCertificateNumber());
        response.setVerificationStatus(status);
        response.setMessage(message);
        response.setVerifiedAt(verification.getVerifiedAt());
        
        if (status == VerificationStatus.VALID || status == VerificationStatus.TAMPERED) {
            response.setStudentName(cert.getStudentName());
            response.setCourseName(cert.getCourseName());
            response.setInstitutionName(cert.getInstitutionName());
            response.setIssueDate(cert.getIssueDate());
            response.setCertificateStatus(cert.getStatus());
        }

        return response;
    }
}
