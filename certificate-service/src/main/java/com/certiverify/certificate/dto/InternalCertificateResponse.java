package com.certiverify.certificate.dto;

import com.certiverify.certificate.model.Certificate;
import com.certiverify.certificate.model.CertificateStatus;

import java.time.LocalDate;
import java.util.UUID;

public class InternalCertificateResponse {

    private UUID certificateId;
    private Long applicationId;
    private String certificateNumber;
    private UUID studentId;
    private String studentName;
    private String courseName;
    private UUID institutionId;
    private String institutionName;
    private LocalDate issueDate;
    private CertificateStatus status;
    private String certificateHash;

    public InternalCertificateResponse() {
    }

    public InternalCertificateResponse(Certificate certificate) {
        this.certificateId = certificate.getCertificateId();
        this.applicationId = certificate.getApplicationId();
        this.certificateNumber = certificate.getCertificateNumber();
        this.studentId = certificate.getStudentId();
        this.studentName = certificate.getStudentName();
        this.courseName = certificate.getCourseName();
        this.institutionId = certificate.getInstitutionId();
        this.institutionName = certificate.getInstitutionName();
        this.issueDate = certificate.getIssueDate();
        this.status = certificate.getStatus();
        this.certificateHash = certificate.getCertificateHash();
    }

    public UUID getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(UUID certificateId) {
        this.certificateId = certificateId;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
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
}
