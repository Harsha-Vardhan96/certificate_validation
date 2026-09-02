package com.certiverify.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CertificateIssueRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotNull(message = "Institution ID is required")
    private UUID institutionId;

    @NotBlank(message = "Institution name is required")
    private String institutionName;

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
}
