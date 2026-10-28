package com.certiverify.verification.service;

import com.certiverify.verification.dto.InternalCertificateResponse;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class HashVerificationService {

    public boolean verifyHash(InternalCertificateResponse certificate, String providedHash) {
        if (providedHash == null || providedHash.isEmpty()) {
            return false;
        }
        String calculatedHash = generateCertificateHash(certificate);
        return providedHash.equals(calculatedHash);
    }

    private String generateCertificateHash(InternalCertificateResponse certificate) {
        // Must exactly match Certificate Service format:
        // certificateId|applicationId|studentId|studentName|courseName|institutionId|institutionName|issueDate
        String canonicalData = String.join("|",
                certificate.getCertificateId().toString(),
                certificate.getApplicationId().toString(),
                certificate.getStudentId().toString(),
                certificate.getStudentName(),
                certificate.getCourseName(),
                certificate.getInstitutionId().toString(),
                certificate.getInstitutionName(),
                certificate.getIssueDate().toString()
        );

        return hashString(canonicalData);
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
