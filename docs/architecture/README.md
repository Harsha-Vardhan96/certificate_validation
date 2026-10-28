# CertiVerify Global - Architecture Documentation

## 1. System Overview

CertiVerify Global is an enterprise-grade digital credential issuance, management, and cryptographic verification platform. The system uses a microservices architecture implemented with Spring Boot and Spring Cloud, backed by a React single-page application and dedicated PostgreSQL databases for each service.

```mermaid
graph TD
    subgraph Client Tier
        Browser["React Frontend (Port 5173)<br/>Vite + Tailwind / CSS"]
        PublicUser["Public Verifier (Web / QR Scan)"]
    end

    subgraph Gateway & Discovery
        Gateway["API Gateway (Port 8080)<br/>Spring Cloud Gateway + Reactive Security"]
        Eureka["Eureka Server (Port 8761)<br/>Spring Cloud Netflix Eureka"]
    end

    subgraph Microservices Backend
        Auth["Auth Service (Port 8081)<br/>Spring Security + JWT + BCrypt"]
        App["Application Service (Port 8082)<br/>Spring Data JPA + OpenFeign"]
        Cert["Certificate Service (Port 8083)<br/>PDFBox + ZXing QR + SHA-256"]
        Verify["Verification Service (Port 8084)<br/>Cryptographic Hash Verification"]
    end

    subgraph Persistence Tier
        DB_Auth[(auth_db<br/>PostgreSQL:5433)]
        DB_App[(application_db<br/>PostgreSQL:5433)]
        DB_Cert[(certificate_db<br/>PostgreSQL:5433)]
        DB_Verify[(verification_db<br/>PostgreSQL:5433)]
    end

    Browser -->|HTTP / JSON + JWT| Gateway
    PublicUser -->|GET /api/verify/:id| Gateway

    Gateway -.->|Service Lookup| Eureka
    Auth -.->|Register / Heartbeat| Eureka
    App -.->|Register / Heartbeat| Eureka
    Cert -.->|Register / Heartbeat| Eureka
    Verify -.->|Register / Heartbeat| Eureka

    Gateway -->|/api/auth/**| Auth
    Gateway -->|/api/applications/**| App
    Gateway -->|/api/certificates/**| Cert
    Gateway -->|/api/verify/**| Verify

    App -->|OpenFeign: /api/certificates/issue| Cert
    Verify -->|OpenFeign: /api/certificates/internal/:id| Cert

    Auth --- DB_Auth
    App --- DB_App
    Cert --- DB_Cert
    Verify --- DB_Verify
```

---

## 2. Microservice Topology

| Service | Port | Database | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Eureka Server** | `8761` | None | Dynamic service registration, heartbeats, and client-side discovery. |
| **API Gateway** | `8080` | None | Central routing, CORS handling, JWT token validation, and traffic forwarding. |
| **Auth Service** | `8081` | `auth_db` | User management, registration, BCrypt password hashing, and role-based JWT issuance. |
| **Application Service** | `8082` | `application_db` | Student application lifecycle (PENDING, APPROVED, REJECTED) and Feign orchestration. |
| **Certificate Service** | `8083` | `certificate_db` | Canonical SHA-256 hashing, QR code generation, PDF generation, and student/institution retrieval. |
| **Verification Service** | `8084` | `verification_db` | Public certificate authenticity verification against cryptographic hashes. |

---

## 3. Core Business Flows

### 3.1 Application Submission & Approval Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    actor Institution
    participant Gateway as API Gateway
    participant AppService as Application Service
    participant CertService as Certificate Service
    participant DB as certificate_db

    Student->>Gateway: POST /api/applications (JWT: STUDENT)
    Gateway->>AppService: Forward request
    AppService-->>Gateway: 201 Created (Status: PENDING)
    Gateway-->>Student: Application Created

    Institution->>Gateway: PUT /api/applications/{id}/approve (JWT: INSTITUTION)
    Gateway->>AppService: Forward approval
    Note over AppService: Verify institution ownership
    AppService->>CertService: POST /api/certificates/issue (Feign + propagated JWT)
    Note over CertService: Generate Canonical Hash, QR Code, PDF bytes
    CertService->>DB: Save Certificate (status: ISSUED)
    CertService-->>AppService: 201 Created (CertificateResponse)
    Note over AppService: Update application status to APPROVED
    AppService-->>Gateway: 200 OK
    Gateway-->>Institution: Application Approved & Certificate Issued
```

### 3.2 Student Listing & PDF Download Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Gateway as API Gateway
    participant CertService as Certificate Service

    Student->>Gateway: GET /api/certificates/my (Bearer JWT)
    Gateway->>CertService: Route to /api/certificates/my
    Note over CertService: Extract student UUID from JWT claims<br/>findByStudentId(userId)
    CertService-->>Gateway: 200 OK (List of student's certificates)
    Gateway-->>Student: Display in "My Certificates" table

    Student->>Gateway: GET /api/certificates/{id}/download (Bearer JWT)
    Gateway->>CertService: Route to download endpoint
    Note over CertService: Verify certificate studentId matches JWT userId
    CertService-->>Gateway: 200 OK (application/pdf bytes)
    Gateway-->>Student: Trigger browser download as PDF
```

---

## 4. Security Architecture

1. **Decentralized Token Verification:**
   - Tokens are issued by `auth-service` signed with HMAC-SHA256 (`jwt.secret`).
   - `api-gateway` performs preliminary gateway-level JWT authentication.
   - Downstream services (`application-service`, `certificate-service`) employ individual `JwtAuthenticationFilter` instances, enforcing role checks (`@PreAuthorize`) and identity extraction server-side.
2. **Strict Identity Isolation:**
   - Student ID in token claims maps to the authenticated principal.
   - Cross-student access is blocked server-side: a student cannot query or download another student's certificate.
   - Non-student roles attempting to invoke `/api/certificates/my` receive `403 Forbidden`.
