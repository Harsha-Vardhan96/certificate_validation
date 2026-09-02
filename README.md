# CertiVerify GLOBAL
"Verifiable Digital Credentials & Certificate Issuance Engine"

## Purpose
CertiVerify is a system designed to issue, manage, and verify digital certificates efficiently and securely.

## Microservice Architecture
The backend is composed of the following independent Spring Boot microservices:

1. **eureka-server** (Port: 8761) - Service registry for all microservices.
2. **api-gateway** (Port: 8080) - Single entry point for frontend React application. Routes requests to appropriate services.
3. **auth-service** (Port: 8081) - Manages user authentication, registration, roles, and JWT generation.
4. **application-service** (Port: 8082) - Handles certificate application submissions and approvals.
5. **certificate-service** (Port: 8083) - Handles certificate generation (ID, QR code, PDF, SHA-256 hash).
6. **verification-service** (Port: 8084) - Verifies public certificates against tampered states.

## Technology Stack
- **Language**: Java 21
- **Build**: Maven
- **Framework**: Spring Boot 4.0.8
- **Spring Cloud**: 2025.1.3
- **Database**: PostgreSQL (Spring Data JPA)
- **Security**: Spring Security & JWT (BCrypt)
- **Service Discovery**: Spring Cloud Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Inter-service**: Spring Cloud OpenFeign
- **Testing**: JUnit 5, Mockito

## User Roles
1. **STUDENT**: Register/login, apply for certificates, view/download certificates.
2. **INSTITUTION**: Login, view/approve applications, issue/revoke certificates.
3. **ADMIN**: Manage users/institutions, manage all certificates.
*Note: Public users can verify certificates without an account.*

## High-Level Certificate Flow
1. **Student** submits an application via application-service.
2. **Institution** approves the application.
3. certificate-service generates a unique ID, SHA-256 hash, QR code, and PDF.
4. Certificate is Issued.
5. **Public User** verifies the certificate via verification-service by looking up the ID and validating the hash.

## Database Architecture
Each microservice maintains its own distinct PostgreSQL database to enforce decoupled architecture:
- auth_db
- application_db
- certificate_db
- verification_db

Cross-service data access happens strictly through REST APIs (OpenFeign).

## Inter-Service Communication & Eureka
- eureka-server acts as the service registry.
- All other services (Clients) register with Eureka on startup.
- OpenFeign is used for synchronous communication between services.
- Load balancing is handled natively through Spring Cloud LoadBalancer.
