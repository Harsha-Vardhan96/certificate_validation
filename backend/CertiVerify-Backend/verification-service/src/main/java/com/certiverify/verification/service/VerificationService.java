package com.certiverify.verification.service;

import com.certiverify.verification.dto.VerificationResponse;

import java.util.UUID;

public interface VerificationService {
    VerificationResponse verifyCertificate(UUID certificateId);
}
