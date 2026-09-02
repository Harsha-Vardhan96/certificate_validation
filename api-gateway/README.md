# API Gateway

The API Gateway is a Spring Cloud Gateway (Reactive) infrastructure component that serves as the single entry point to the CertiVerify Global microservices ecosystem. It handles routing, load balancing, initial CORS validation, and defense-in-depth JWT authentication.

## Purpose of API Gateway

The API Gateway serves several critical roles:
1. **Single Entry Point**: The frontend only needs to know about `localhost:8080`. It doesn't need to know the IPs and ports of every microservice.
2. **Authentication / Defense in Depth**: The Gateway validates that incoming requests to protected routes contain a structurally valid and properly signed JWT. It rejects invalid/expired tokens instantly at the edge without putting load on backend services.
3. **CORS Handling**: The gateway handles Preflight (`OPTIONS`) requests and CORS headers so individual microservices don't need redundant configuration.
4. **Load Balancing**: Combined with Eureka, the Gateway discovers multiple instances of a service and load-balances requests transparently.

## Route Table

| Gateway Path | Target Service | Authentication Required |
|---|---|---|
| `/api/auth/login`, `/register` | `AUTH-SERVICE` | No (Public) |
| `/api/verify/**` | `VERIFICATION-SERVICE` | No (Public) |
| `/api/auth/**` | `AUTH-SERVICE` | Yes (Protected) |
| `/api/applications/**` | `APPLICATION-SERVICE`| Yes (Protected) |
| `/api/certificates/**` | `CERTIFICATE-SERVICE`| Yes (Protected) |

## JWT Authentication Behavior

- **Gateway Role (Authentication):** The Gateway extracts the Bearer token, verifies its signature using the symmetric secret, and confirms it hasn't expired. It allows the request to pass to the backend if valid.
- **Microservice Role (Authorization):** The individual microservices remain strictly responsible for role checks (e.g., `hasRole('ADMIN')`) and data ownership checks (e.g., "does this student own this application?").

## Communication & Load Balancing

When a request arrives at `http://localhost:8080/api/applications/my`:
1. The Gateway intercepts the request.
2. It validates the JWT.
3. It maps `/api/applications/**` to `lb://APPLICATION-SERVICE`.
4. It asks Eureka: "Where is `APPLICATION-SERVICE`?"
5. Eureka replies with an IP and Port (e.g., `127.0.0.1:8082`).
6. The Gateway forwards the request to that specific instance, retaining the `Authorization` header.

## How to run it

```bash
mvn clean package
java -jar target/api-gateway-0.0.1-SNAPSHOT.jar
```
*Note: Make sure Eureka Server (`localhost:8761`) is running.*

## Example Requests

**Public Verification** (No JWT required)
```bash
curl http://localhost:8080/api/verify/123e4567-e89b-12d3-a456-426614174000
```

**Protected Request** (Requires JWT)
```bash
curl -H "Authorization: Bearer <your_jwt_token>" http://localhost:8080/api/applications/my
```
