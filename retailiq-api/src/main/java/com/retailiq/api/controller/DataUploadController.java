package com.retailiq.api.controller;

import com.retailiq.api.entity.UploadHistory;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.service.DataUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataUploadController {

    private final DataUploadService dataUploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UploadHistory>> upload(@RequestParam("file") MultipartFile file)
            throws IOException {
        UploadHistory history = dataUploadService.processUpload(file);
        return ResponseEntity.ok(ApiResponse.success(history, "File uploaded and ETL triggered"));
    }

    @GetMapping("/upload/history")
    public ResponseEntity<ApiResponse<List<UploadHistory>>> getHistory() {
        return ResponseEntity.ok(ApiResponse.success(dataUploadService.getAllHistory(), "Upload history retrieved"));
    }

    @GetMapping("/upload/{id}/errors")
    public ResponseEntity<ApiResponse<String>> getErrors(@PathVariable Long id) {
        UploadHistory history = dataUploadService.getUploadById(id);
        return ResponseEntity.ok(ApiResponse.success(history.getErrorDetails(), "Error details retrieved"));
    }

    @DeleteMapping("/upload/history/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(@PathVariable Long id) {
        dataUploadService.deleteHistoryById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Upload history deleted successfully"));
    }
}
