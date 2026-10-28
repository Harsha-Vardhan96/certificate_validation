# CertiVerify Global - API Documentation

All client requests originate through the **API Gateway** on `http://localhost:8080`.

---

## 1. Authentication Service (`/api/auth`)

### 1.1 Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "STUDENT"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "userId": 14,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "STUDENT"
  }
  ```

### 1.2 Login User
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response (`200 OK`):** Same schema as Register.

---

## 2. Application Service (`/api/applications`)

### 2.1 Submit Application
- **Method:** `POST`
- **Path:** `/api/applications`
- **Access:** `ROLE_STUDENT`
- **Request Body:**
  ```json
  {
    "institutionId": 15,
    "institutionName": "KL University",
    "courseName": "B.Tech Computer Science"
  }
  ```

### 2.2 List My Applications
- **Method:** `GET`
- **Path:** `/api/applications/my`
- **Access:** `ROLE_STUDENT`
- **Response (`200 OK`):** Array of `ApplicationResponse`.

### 2.3 Get Application Details
- **Method:** `GET`
- **Path:** `/api/applications/{applicationId}`
- **Access:** `STUDENT` (must own application), `INSTITUTION` (must be issuing institution), or `ADMIN`.

### 2.4 Approve Application
- **Method:** `PUT`
- **Path:** `/api/applications/{applicationId}/approve`
- **Access:** `ROLE_INSTITUTION`
- **Behavior:** Triggers synchronous Feign call to `certificate-service` to generate cryptographic certificate, updates status to `APPROVED`.

### 2.5 Reject Application
- **Method:** `PUT`
- **Path:** `/api/applications/{applicationId}/reject`
- **Access:** `ROLE_INSTITUTION`
- **Request Body:**
  ```json
  {
    "rejectionReason": "Prerequisites not satisfied"
  }
  ```

---

## 3. Certificate Service (`/api/certificates`)

### 3.1 List Authenticated Student Certificates
- **Method:** `GET`
- **Path:** `/api/certificates/my` (also aliased as `/api/certificates/student`)
- **Access:** `ROLE_STUDENT`
- **Response (`200 OK`):**
  ```json
  [
    {
      "certificateId": "87626b73-e4fb-421a-bd81-f4f14e56148e",
      "certificateNumber": "CVG-2026-83F38164",
      "applicationId": 5,
      "studentId": "00000000-0000-0000-0000-00000000000e",
      "studentName": "Student Name",
      "courseName": "B.Tech Computer Science",
      "institutionId": "00000000-0000-0000-0000-00000000000f",
      "institutionName": "KL University",
      "issueDate": "2026-10-28",
      "status": "ISSUED",
      "certificateHash": "3f8a...",
      "qrCodeData": "http://localhost:8080/api/verify/87626b73-...",
      "createdAt": "2026-10-28T20:35:59",
      "updatedAt": null
    }
  ]
  ```

### 3.2 Get Certificate Details
- **Method:** `GET`
- **Path:** `/api/certificates/{certificateId}`
- **Access:** Authenticated `STUDENT` (must own certificate), `INSTITUTION` (must be issuing institution), or `ADMIN`.

### 3.3 Download Certificate PDF
- **Method:** `GET`
- **Path:** `/api/certificates/{certificateId}/download`
- **Access:** Authenticated `STUDENT` (must own certificate) or issuing `INSTITUTION`.
- **Response (`200 OK`):**
  - Content-Type: `application/pdf`
  - Content-Disposition: `attachment; filename="certificate-{id}.pdf"`

### 3.4 Revoke Certificate
- **Method:** `PUT`
- **Path:** `/api/certificates/{certificateId}/revoke`
- **Access:** `ROLE_INSTITUTION` or `ROLE_ADMIN`

---

## 4. Verification Service (`/api/verify`)

### 4.1 Verify Certificate by ID or Hash
- **Method:** `GET`
- **Path:** `/api/verify/{identifier}`
- **Access:** Public (No authentication required)
- **Response (`200 OK`):**
  ```json
  {
    "certificateId": "87626b73-e4fb-421a-bd81-f4f14e56148e",
    "status": "VALID",
    "studentName": "Student Name",
    "courseName": "B.Tech Computer Science",
    "institutionName": "KL University",
    "issueDate": "2026-10-28",
    "certificateHash": "3f8a..."
  }
  ```
