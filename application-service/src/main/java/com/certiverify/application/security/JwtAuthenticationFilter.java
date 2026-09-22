package com.certiverify.application.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        System.out.println(">>> JwtAuthenticationFilter instantiated!");
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        System.out.println(">>> ENTERING doFilterInternal: URI=" + request.getRequestURI() + ", AuthHeader=" + request.getHeader("Authorization"));
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println(">>> SKIPPING: authHeader is null or doesn't start with Bearer: " + authHeader);
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        System.out.println(">>> JwtAuthenticationFilter RUNNING for: " + request.getRequestURI());
        System.out.println(">>> AuthHeader: " + authHeader);
        try {
            userEmail = jwtService.extractUsername(jwt);
            System.out.println(">>> Extracted userEmail: " + userEmail);
            System.out.println(">>> Current SecurityContext authentication: " + SecurityContextHolder.getContext().getAuthentication());
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                boolean valid = jwtService.isTokenValid(jwt);
                System.out.println(">>> isTokenValid: " + valid);
                if (valid) {
                    String role = jwtService.extractRole(jwt);
                    System.out.println(">>> Extracted role: " + role);
                    Long userId = jwtService.extractUserId(jwt);
                    System.out.println(">>> Extracted userId: " + userId);

                    AuthenticatedUser authenticatedUser = new AuthenticatedUser(userId, userEmail, role);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            authenticatedUser,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println(">>> Set SecurityContext: " + SecurityContextHolder.getContext().getAuthentication());
                    System.out.println(">>> Principal: " + SecurityContextHolder.getContext().getAuthentication().getPrincipal());
                    System.out.println(">>> Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                }
            }
        } catch (Exception e) {
            System.out.println(">>> EXCEPTION in JwtAuthenticationFilter: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
        System.out.println(">>> After filterChain, SecurityContext: " + SecurityContextHolder.getContext().getAuthentication());
    }
}
