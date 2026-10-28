package com.certiverify.application.dto;

import com.certiverify.application.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public class ReviewRequest {

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    private String comments;

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
