package com.certiverify.application.repository;

import com.certiverify.application.model.Application;
import com.certiverify.application.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    List<Application> findByInstitutionId(Long institutionId);
    List<Application> findByInstitutionIdAndStatus(Long institutionId, ApplicationStatus status);
    List<Application> findByStudentIdAndInstitutionId(Long studentId, Long institutionId);
}
