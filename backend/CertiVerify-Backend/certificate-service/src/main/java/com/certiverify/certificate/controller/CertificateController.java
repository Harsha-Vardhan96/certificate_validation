package com.certiverify.certificate.controller;

import com.certiverify.certificate.dto.CertificateIssueRequest;
import com.certiverify.certificate.dto.CertificateResponse;
import com.certiverify.certificate.security.AuthenticatedUser;
import com.certiverify.certificate.service.CertificateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping("/issue")
    @PreAuthorize("hasRole('INSTITUTION')")
    public ResponseEntity<CertificateResponse> issueCertificate(
            @Valid @RequestBody CertificateIssueRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        CertificateResponse response = certificateService.issueCertificate(request, user.getUserId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/my", "/student"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates(
            @AuthenticationPrincipal AuthenticatedUser user) {
        List<CertificateResponse> certificates = certificateService.getStudentCertificates(user.getUserId());
        return ResponseEntity.ok(certificates);
    }

    @GetMapping("/{certificateId}")
    public ResponseEntity<CertificateResponse> getCertificateById(
            @PathVariable UUID certificateId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        CertificateResponse response = certificateService.getCertificateById(certificateId, user.getUserId(), user.getRole());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{certificateId}/download")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable UUID certificateId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        byte[] pdfBytes = certificateService.downloadCertificatePdf(certificateId, user.getUserId(), user.getRole());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "certificate-" + certificateId + ".pdf");
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PutMapping("/{certificateId}/revoke")
    @PreAuthorize("hasRole('INSTITUTION') or hasRole('ADMIN')")
    public ResponseEntity<CertificateResponse> revokeCertificate(
            @PathVariable UUID certificateId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        CertificateResponse response = certificateService.revokeCertificate(certificateId, user.getUserId(), user.getRole());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/internal/{certificateId}")
    public ResponseEntity<com.certiverify.certificate.dto.InternalCertificateResponse> getInternalCertificateById(
            @PathVariable UUID certificateId) {
        com.certiverify.certificate.dto.InternalCertificateResponse response = certificateService.getInternalCertificateById(certificateId);
        return ResponseEntity.ok(response);
    }
}
