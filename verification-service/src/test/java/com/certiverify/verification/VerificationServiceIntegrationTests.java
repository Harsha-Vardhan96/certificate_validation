package com.certiverify.verification;

import com.certiverify.verification.client.CertificateClient;
import com.certiverify.verification.dto.InternalCertificateResponse;
import com.certiverify.verification.dto.VerificationResponse;
import com.certiverify.verification.model.VerificationStatus;
import com.certiverify.verification.service.HashVerificationService;
import feign.FeignException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class VerificationServiceIntegrationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private CertificateClient certificateClient;

    @MockBean
    private HashVerificationService hashVerificationService;

    @Test
    public void testValidCertificate() {
        UUID certificateId = UUID.randomUUID();
        
        InternalCertificateResponse mockResponse = new InternalCertificateResponse();
        mockResponse.setCertificateId(certificateId);
        mockResponse.setStatus("ISSUED");
        mockResponse.setCertificateHash("valid-hash");

        when(certificateClient.getInternalCertificateById(certificateId)).thenReturn(mockResponse);
        when(hashVerificationService.verifyHash(any(), any())).thenReturn(true);

        ResponseEntity<VerificationResponse> response = restTemplate.getForEntity("/api/verify/" + certificateId, VerificationResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(VerificationStatus.VALID, response.getBody().getVerificationStatus());
    }

    @Test
    public void testTamperedCertificate() {
        UUID certificateId = UUID.randomUUID();
        
        InternalCertificateResponse mockResponse = new InternalCertificateResponse();
        mockResponse.setCertificateId(certificateId);
        mockResponse.setStatus("ISSUED");
        mockResponse.setCertificateHash("tampered-hash");

        when(certificateClient.getInternalCertificateById(certificateId)).thenReturn(mockResponse);
        when(hashVerificationService.verifyHash(any(), any())).thenReturn(false);

        ResponseEntity<VerificationResponse> response = restTemplate.getForEntity("/api/verify/" + certificateId, VerificationResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(VerificationStatus.TAMPERED, response.getBody().getVerificationStatus());
    }

    @Test
    public void testRevokedCertificate() {
        UUID certificateId = UUID.randomUUID();
        
        InternalCertificateResponse mockResponse = new InternalCertificateResponse();
        mockResponse.setCertificateId(certificateId);
        mockResponse.setStatus("REVOKED");

        when(certificateClient.getInternalCertificateById(certificateId)).thenReturn(mockResponse);

        ResponseEntity<VerificationResponse> response = restTemplate.getForEntity("/api/verify/" + certificateId, VerificationResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(VerificationStatus.REVOKED, response.getBody().getVerificationStatus());
    }

    @Test
    public void testInvalidCertificateNotFound() {
        UUID certificateId = UUID.randomUUID();
        
        FeignException.NotFound notFoundException = org.mockito.Mockito.mock(FeignException.NotFound.class);
        when(certificateClient.getInternalCertificateById(certificateId)).thenThrow(notFoundException);

        ResponseEntity<VerificationResponse> response = restTemplate.getForEntity("/api/verify/" + certificateId, VerificationResponse.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(VerificationStatus.INVALID, response.getBody().getVerificationStatus());
    }

    @Test
    public void testServiceUnavailable() {
        UUID certificateId = UUID.randomUUID();
        
        FeignException.ServiceUnavailable serviceUnavailable = org.mockito.Mockito.mock(FeignException.ServiceUnavailable.class);
        when(certificateClient.getInternalCertificateById(certificateId)).thenThrow(serviceUnavailable);

        ResponseEntity<String> response = restTemplate.getForEntity("/api/verify/" + certificateId, String.class);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    }
}
