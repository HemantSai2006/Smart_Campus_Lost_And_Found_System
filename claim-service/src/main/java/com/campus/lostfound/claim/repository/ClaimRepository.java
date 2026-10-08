package com.campus.lostfound.claim.repository;

import com.campus.lostfound.claim.entity.Claim;
import com.campus.lostfound.claim.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByClaimantUserIdOrderByCreatedAtDesc(Long claimantUserId);
    List<Claim> findByStatusOrderByCreatedAtDesc(ClaimStatus status);
    List<Claim> findAllByOrderByCreatedAtDesc();
    long countByStatus(ClaimStatus status);
    boolean existsByItemIdAndClaimantUserIdAndStatus(Long itemId, Long claimantUserId, ClaimStatus status);
    List<Claim> findByItemIdAndStatus(Long itemId, ClaimStatus status);
}