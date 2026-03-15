package com.retailiq.api.service;

import com.retailiq.api.entity.UploadHistory;
import com.retailiq.api.entity.User;
import com.retailiq.api.repository.UploadHistoryRepository;
import com.retailiq.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataUploadService {

    private final UploadHistoryRepository uploadHistoryRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${analytics.service.url:http://localhost:8000}")
    private String analyticsServiceUrl;

    @Value("${upload.storage.path:./uploads}")
    private String uploadStoragePath;

    public UploadHistory processUpload(MultipartFile file) throws IOException {
        // Validate file type
        String originalName = file.getOriginalFilename();
        if (originalName == null || (!originalName.endsWith(".csv") && !originalName.endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Only CSV and Excel (.xlsx) files are supported");
        }

        // Save file to disk
        String storedFilename = UUID.randomUUID() + "_" + originalName;
        Path uploadDir = Paths.get(uploadStoragePath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        Path filePath = uploadDir.resolve(storedFilename);
        try (java.io.InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }

        // Determine uploading user
        User uploader = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            uploader = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        // Create upload history record
        UploadHistory history = UploadHistory.builder()
                .filename(storedFilename)
                .originalName(originalName)
                .fileSize(file.getSize())
                .status("PROCESSING")
                .uploadedBy(uploader)
                .build();
        history = uploadHistoryRepository.save(history);

        // Trigger Python ETL async
        triggerEtlPipeline(history, filePath.toAbsolutePath().toString());

        return history;
    }

    private void triggerEtlPipeline(UploadHistory history, String absoluteFilePath) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "job_id", history.getId(),
                    "file_path", absoluteFilePath,
                    "original_name", history.getOriginalName());
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    analyticsServiceUrl + "/etl/process", request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("ETL pipeline triggered for upload id={}", history.getId());
            } else {
                markFailed(history, "ETL service responded with: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Failed to trigger ETL for upload id={}: {}", history.getId(), e.getMessage());
            markFailed(history, e.getMessage());
        }
    }

    private void markFailed(UploadHistory history, String reason) {
        history.setStatus("FAILED");
        history.setErrorDetails(reason);
        history.setCompletedAt(LocalDateTime.now());
        uploadHistoryRepository.save(history);
    }

    public List<UploadHistory> getAllHistory() {
        return uploadHistoryRepository.findAllByOrderByStartedAtDesc();
    }

    public UploadHistory getUploadById(Long id) {
        return uploadHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Upload record not found: " + id));
    }

    public void deleteHistoryById(Long id) {
        UploadHistory history = getUploadById(id);
        
        // Try to delete the physical file
        if (history.getFilename() != null) {
            Path filePath = Paths.get(uploadStoragePath).resolve(history.getFilename());
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                log.warn("Failed to delete physical file for upload history {}: {}", id, e.getMessage());
            }
        }
        
        // Delete the database record
        uploadHistoryRepository.delete(history);
    }
}
