package com.certiverify.certificate.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${certificate.internal-service-key:}")
    private String internalApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/api/certificates/internal/")) {
            String apiKey = request.getHeader("X-Internal-Service-Key");

            if (internalApiKey == null || internalApiKey.isEmpty()) {
                response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal API key is not configured.");
                return;
            }

            if (apiKey == null || !apiKey.equals(internalApiKey)) {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Missing or invalid internal API key.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
