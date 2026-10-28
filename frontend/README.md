# CertiVerify Global - Frontend Portal

The React single-page frontend application for CertiVerify Global, providing dedicated portals for Students, Institutions, Administrators, and Public Verification.

---

## 1. Portals & Features

- **Student Portal:**
  - Submit digital certificate applications to registered institutions.
  - Track application status in real-time (`PENDING`, `APPROVED`, `REJECTED`).
  - View verified certificates in the **My Certificates** table.
  - Download official PDF credentials directly with one click.
- **Institution Portal:**
  - Review pending student credential requests.
  - Approve applications (triggers automated cryptographic certificate issuance).
  - Inspect approved institutional credentials and verify digital authenticity.
- **Admin Portal:**
  - Platform-wide overview, user management, and credential supervision.
  - Inspect cryptographic certificate details and execute administrative revocations.
- **Public Verification:**
  - Instant public certificate lookup by certificate UUID or Certificate Number.
  - Dynamic QR Code scanning compatibility with verification feedback.

---

## 2. Getting Started

### 2.1 Configuration
Copy the environment template:
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your running API Gateway (defaults to `http://localhost:8080`).

### 2.2 Installation & Development
```bash
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.

### 2.3 Production Build
```bash
npm run build
```
Built production assets will be output to the `dist/` directory.

---

## 3. Architecture & Authentication

- **Client State:** Authenticated session state is maintained in `AuthContext.jsx` with secure localStorage persistence.
- **API Interceptor:** `services/api.js` automatically attaches the user's Bearer JWT to all outgoing requests.
- **Protected Routing:** `ProtectedRoute.jsx` enforces role-based access control (`STUDENT`, `INSTITUTION`, `ADMIN`) across client routes.
