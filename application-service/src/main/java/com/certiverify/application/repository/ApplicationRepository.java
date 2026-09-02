package com.certiverify.application.repository;

import com.certiverify.application.model.Application;
import com.certiverify.application.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(UUID studentId);
    List<Application> findByInstitutionId(UUID institutionId);
    List<Application> findByInstitutionIdAndStatus(UUID institutionId, ApplicationStatus status);
}
