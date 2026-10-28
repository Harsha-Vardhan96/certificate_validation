# Verification Service

The Verification Service is a public-facing microservice responsible for verifying the authenticity and integrity of certificates issued by the CertiVerify Global system. It allows anyone to scan a QR code or enter a Certificate ID to verify a certificate without requiring a login or JWT token.

## Architecture & Data Ownership

- **Public Verification:** The `GET /api/verify/{certificateId}` endpoint is completely public.
- **Data Ownership:** The Verification Service **does not** own the certificate data and **does not** access `certificate_db` directly. Certificate data is strictly owned by the Certificate Service.
- **Verification Logs:** The Verification Service owns the `verification_db`, which acts as an audit log for every verification attempt.

```text
Public User
     ↓
GET /api/verify/{certificateId}
     ↓
Verification Service
     ↓
OpenFeign
     ↓
Certificate Service
     ↓
Internal API
     ↓
certificate_db
     ↓
Certificate data + stored hash
     ↓
Verification Service
     ↓
Recalculate SHA-256
     ↓
Compare hashes
     ↓
VALID / TAMPERED / REVOKED / INVALID
```

## Internal API & Security

Since the Verification Service needs to access certificate data, it calls an **internal** endpoint on the Certificate Service: `GET /api/certificates/internal/{certificateId}`.

To protect this endpoint from unauthorized public access while bypassing the standard JWT student/institution checks, we use a service-to-service internal API key (`X-Internal-Service-Key`). The Verification Service securely attaches this key to its internal requests using a Feign `RequestInterceptor`.

## Verification Outcomes

The Verification Service applies strict cryptographic verification using SHA-256:

1. **VALID:** The certificate exists, is ISSUED, and the recalculated SHA-256 hash perfectly matches the original hash stored in the Certificate Service.
2. **INVALID:** The Certificate Service reported that the certificate UUID does not exist.
3. **REVOKED:** The certificate exists, but the issuing institution or an admin has officially revoked it.
4. **TAMPERED:** The certificate exists and is ISSUED, but the recalculated SHA-256 hash does NOT match the stored hash, indicating that core data fields were altered.

## College Viva Questions & Answers

### What is a REST client?
A REST client is software or code that sends HTTP requests to a RESTful web service API and processes the responses. In a microservices architecture, a REST client allows one microservice to communicate with another over the network.

### What is OpenFeign?
OpenFeign is a declarative web service client provided by Spring Cloud. Instead of manually constructing HTTP requests using `RestTemplate` or `WebClient`, OpenFeign allows us to define an interface with annotations (like `@GetMapping`). Spring automatically generates the implementation at runtime to make the HTTP calls.

### What does Eureka do in this process?
Eureka is a Service Registry. Instead of hardcoding the IP address and port of the Certificate Service (e.g., `http://localhost:8083`), the Verification Service asks Eureka for the location of `certificate-service`. OpenFeign then uses this dynamically discovered address to make the HTTP request. This enables easy scaling and load balancing.

### Why not just let Verification Service read `certificate_db` directly?
This violates the core microservices principle of **Database per Service**. If multiple services access the same database directly, they become tightly coupled. If the Certificate Service changes its database schema, the Verification Service would break. By communicating via APIs, services remain loosely coupled and maintain strict data ownership.
