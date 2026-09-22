# CertiVerify - Auth Service

The `auth-service` manages secure user authentication and authorization for the CertiVerify Global platform. It issues and validates JSON Web Tokens (JWT) using stateless Spring Security.

## Architecture & Layers
* **Controller (`AuthController`)**: Exposes REST endpoints for `/register`, `/login`, and `/admin/users`.
* **Service (`AuthService`)**: Contains core business logic, BCrypt hashing, JWT token generation, and Demo mode rules enforcement.
* **Repository (`UserRepository`)**: Spring Data JPA repository interacting with PostgreSQL.
* **Model (`User`, `Role`)**: JPA Entities representing a user with roles (`STUDENT`, `INSTITUTION`, `ADMIN`).
* **Security (`JwtService`, `JwtAuthenticationFilter`, `SecurityConfig`)**: Configures Spring Security to intercept requests, enforce stateless authentication, validate JWT tokens, and secure routes via method-level security (`@PreAuthorize`).
* **DTO (`RegisterRequest`, `LoginRequest`, `AuthResponse`)**: Data Transfer Objects to separate presentation from persistence.
* **Exception (`GlobalExceptionHandler`)**: Maps validation errors and security exceptions to clean JSON responses without leaking stack traces.

## Database & Roles
* Database: `auth_db` (PostgreSQL)
* Roles:
    * `STUDENT`: Can apply for certificates.
    * `INSTITUTION`: Can issue certificates.
    * `ADMIN`: Can manage users and platform settings.

## Normal Mode vs Demo Mode
The behavior of the public `/api/auth/register` endpoint is controlled by `app.demo-mode` in `application.properties`.

* **Normal Mode (`app.demo-mode=false`)**: Only `STUDENT` accounts can be created via the public registration endpoint. Attempts to register as `ADMIN` or `INSTITUTION` will be rejected.
* **Demo Mode (`app.demo-mode=true`)**: Useful for college demonstrations. The public registration endpoint freely allows creating users with any role (`STUDENT`, `INSTITUTION`, `ADMIN`). **WARNING: Do not enable in production.**

## Endpoints
* `POST /api/auth/register` - Public user registration.
* `POST /api/auth/login` - Authenticate using email and password. Returns JWT.
* `POST /api/auth/admin/users` - Protected admin operation. Requires an `ADMIN` JWT token. Used to securely create `INSTITUTION` and `ADMIN` users in Normal Mode.

## Bootstrap Admin
To avoid insecure "create admin" endpoints, the first `ADMIN` account is automatically seeded into the database on startup if it doesn't exist. This is configured via:
```properties
app.bootstrap.admin.email=admin@certiverify.com
app.bootstrap.admin.password=admin123
app.bootstrap.admin.name=System Administrator
```

## JWT Explanation (Viva Question)
**"What happens when a user logs in?"**
1. The client sends a `POST` request to `/api/auth/login` with their `email` and `password`.
2. The `AuthController` passes this to `AuthService`.
3. Spring Security's `AuthenticationManager` verifies the credentials using BCrypt to compare the hashed password in PostgreSQL.
4. If valid, the `JwtService` creates a JSON Web Token (JWT) using the `jjwt` library. This token securely encodes the user's ID, Role, and Email, signed with a secret HMAC key (`jwt.secret`).
5. The JWT is returned to the client in the `AuthResponse`.
6. For all future requests, the client attaches this JWT in the `Authorization: Bearer <token>` header. The `JwtAuthenticationFilter` intercepts the request, verifies the signature, and automatically authenticates the user statelessly without needing a database lookup for every request.

## Configuration
Use environment variables to secure the service in production:
* `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` (PostgreSQL)
* `JWT_SECRET` (Must be a 256-bit+ secure random key)
* `EUREKA_URL` (Eureka Server location)
* `DEMO_MODE` (`true` or `false`)
