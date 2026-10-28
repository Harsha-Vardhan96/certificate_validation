package com.certiverify.certificate.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.util.UUID;

public class CertificateIssueRequest {

    public static class FlexibleUuidDeserializer extends JsonDeserializer<UUID> {
        @Override
        public UUID deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            if (p.currentToken() != null && p.currentToken().isNumeric()) {
                return new UUID(0L, p.getLongValue());
            }
            String text = p.getText();
            if (text == null || text.trim().isEmpty()) {
                return null;
            }
            try {
                return UUID.fromString(text.trim());
            } catch (IllegalArgumentException e) {
                try {
                    return new UUID(0L, Long.parseLong(text.trim()));
                } catch (NumberFormatException nfe) {
                    throw ctxt.instantiationException(UUID.class, "Invalid UUID or numeric identifier: " + text);
                }
            }
        }
    }

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Student ID is required")
    @JsonDeserialize(using = FlexibleUuidDeserializer.class)
    private UUID studentId;

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotNull(message = "Institution ID is required")
    @JsonDeserialize(using = FlexibleUuidDeserializer.class)
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
