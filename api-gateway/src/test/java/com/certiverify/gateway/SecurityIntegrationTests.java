package com.certiverify.gateway;

import com.certiverify.gateway.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
public class SecurityIntegrationTests {

    @Autowired
    private WebTestClient webClient;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    public void testPublicLoginRoute() {
        webClient.post().uri("/api/auth/login")
                .exchange()
                .expectStatus().is5xxServerError();
    }

    @Test
    public void testPublicRegisterRoute() {
        webClient.post().uri("/api/auth/register")
                .exchange()
                .expectStatus().is5xxServerError();
    }

    @Test
    public void testPublicVerifyRoute() {
        webClient.get().uri("/api/verify/123e4567-e89b-12d3-a456-426614174000")
                .exchange()
                .expectStatus().is5xxServerError();
    }

    @Test
    public void testProtectedApplicationRouteMissingJwt() {
        webClient.get().uri("/api/applications/my")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    public void testProtectedCertificateRouteMissingJwt() {
        webClient.get().uri("/api/certificates/123e4567-e89b-12d3-a456-426614174000")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    public void testInvalidJwtRejected() {
        when(jwtUtil.validateToken(anyString())).thenReturn(false);

        webClient.get().uri("/api/applications/my")
                .header("Authorization", "Bearer invalid-token")
                .exchange()
                .expectStatus().isUnauthorized();
    }
}
