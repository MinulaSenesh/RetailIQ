package com.retailiq.api.repository;

import com.retailiq.api.entity.UploadHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadHistoryRepository extends JpaRepository<UploadHistory, Long> {
    List<UploadHistory> findAllByOrderByStartedAtDesc();
}
