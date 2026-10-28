package com.certiverify.verification.repository;

import com.certiverify.verification.model.Verification;
import com.certiverify.verification.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, UUID> {
    List<Verification> findByCertificateId(UUID certificateId);
    List<Verification> findByVerificationStatus(VerificationStatus status);
    List<Verification> findByVerifiedAtAfter(LocalDateTime dateTime);
}
