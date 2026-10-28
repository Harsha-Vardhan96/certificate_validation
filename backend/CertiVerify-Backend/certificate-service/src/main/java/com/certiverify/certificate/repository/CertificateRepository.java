package com.certiverify.certificate.repository;

import com.certiverify.certificate.model.Certificate;
import com.certiverify.certificate.model.CertificateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByApplicationId(Long applicationId);
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    List<Certificate> findByStudentId(UUID studentId);
    List<Certificate> findByInstitutionId(UUID institutionId);
    List<Certificate> findByStatus(CertificateStatus status);
}
