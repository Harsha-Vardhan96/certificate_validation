package com.certiverify.verification.controller;

import com.certiverify.verification.dto.VerificationResponse;
import com.certiverify.verification.service.VerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/verify")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @GetMapping("/{certificateId}")
    public ResponseEntity<VerificationResponse> verifyCertificate(@PathVariable UUID certificateId) {
        VerificationResponse response = verificationService.verifyCertificate(certificateId);
        return ResponseEntity.ok(response);
    }
}
