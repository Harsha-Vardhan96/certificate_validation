package com.certiverify.certificate.dto;

import com.certiverify.certificate.model.Certificate;
import com.certiverify.certificate.model.CertificateStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class CertificateResponse {

    private UUID certificateId;
    private String certificateNumber;
    private Long applicationId;
    private UUID studentId;
    private String studentName;
    private String courseName;
    private UUID institutionId;
    private String institutionName;
    private LocalDate issueDate;
    private CertificateStatus status;
    private String certificateHash;
    private String qrCodeData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CertificateResponse() {}

    public CertificateResponse(Certificate certificate) {
        this.certificateId = certificate.getCertificateId();
        this.certificateNumber = certificate.getCertificateNumber();
        this.applicationId = certificate.getApplicationId();
        this.studentId = certificate.getStudentId();
        this.studentName = certificate.getStudentName();
        this.courseName = certificate.getCourseName();
        this.institutionId = certificate.getInstitutionId();
        this.institutionName = certificate.getInstitutionName();
        this.issueDate = certificate.getIssueDate();
        this.status = certificate.getStatus();
        this.certificateHash = certificate.getCertificateHash();
        this.qrCodeData = certificate.getQrCodeData();
        this.createdAt = certificate.getCreatedAt();
        this.updatedAt = certificate.getUpdatedAt();
    }

    public UUID getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(UUID certificateId) {
        this.certificateId = certificateId;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public UUID getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(UUID institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public CertificateStatus getStatus() {
        return status;
    }

    public void setStatus(CertificateStatus status) {
        this.status = status;
    }

    public String getCertificateHash() {
        return certificateHash;
    }

    public void setCertificateHash(String certificateHash) {
        this.certificateHash = certificateHash;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
