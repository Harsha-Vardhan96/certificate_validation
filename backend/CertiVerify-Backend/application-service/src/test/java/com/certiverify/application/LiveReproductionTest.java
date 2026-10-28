package com.certiverify.application;

import com.certiverify.application.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LiveReproductionTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JwtService jwtService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.certiverify.application.client.CertificateServiceClient certificateServiceClient;

    @Test
    void testDirectRequestWithRealTomcat() {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", 2L);
        extraClaims.put("role", "STUDENT");
        String token = jwtService.generateToken(extraClaims, "student@test.com");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "http://localhost:" + port + "/api/applications/my",
                HttpMethod.GET,
                request,
                String.class
        );

        System.out.println(">>> LIVE REPRODUCTION RESULT <<<");
        System.out.println("STATUS: " + response.getStatusCode());
        System.out.println("BODY: " + response.getBody());
    }
}
