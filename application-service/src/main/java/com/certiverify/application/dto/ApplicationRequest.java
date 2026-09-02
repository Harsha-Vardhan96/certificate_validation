package com.certiverify.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ApplicationRequest {

    @NotNull(message = "Institution ID is required")
    private java.util.UUID institutionId;

    @NotBlank(message = "Institution name is required")
    private String institutionName;

    @NotBlank(message = "Course name is required")
    private String courseName;

    public java.util.UUID getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(java.util.UUID institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }
}
