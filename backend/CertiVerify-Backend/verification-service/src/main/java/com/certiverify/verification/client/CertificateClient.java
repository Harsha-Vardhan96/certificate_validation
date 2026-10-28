package com.certiverify.verification.client;

import com.certiverify.verification.dto.InternalCertificateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "certificate-service")
public interface CertificateClient {

    @GetMapping("/api/certificates/internal/{certificateId}")
    InternalCertificateResponse getInternalCertificateById(@PathVariable("certificateId") UUID certificateId);
}
