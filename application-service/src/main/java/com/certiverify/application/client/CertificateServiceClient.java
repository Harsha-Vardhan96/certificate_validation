package com.certiverify.application.client;

import com.certiverify.application.dto.CertificateIssueRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "certificate-service")
public interface CertificateServiceClient {

    @PostMapping("/api/certificates/issue")
    Object issueCertificate(@RequestBody CertificateIssueRequest request);
}
