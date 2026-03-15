package com.retailiq.api.controller;

import com.retailiq.api.entity.User;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;


    @GetMapping
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = profileService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(user, "Profile retrieved"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody com.retailiq.api.dto.ProfileUpdateRequest updated) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "User session not found"));
            }
            User user = profileService.updateProfile(userDetails.getUsername(), updated);
            return ResponseEntity.ok(ApiResponse.success(user, "Profile updated"));
        } catch (Exception e) {
            log.error("Profile update failed for user {}: {}", userDetails.getUsername(), e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("BAD_REQUEST", "Profile update failed. Please try again."));
        }
    }

    @PostMapping("/photo")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("BAD_REQUEST", "File is empty"));
            }

            Path uploadPath = Paths.get("uploads/profiles").toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".") 
                ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            String avatarUrl = "/api/v1/files/profiles/" + fileName;
            profileService.updateAvatar(userDetails.getUsername(), avatarUrl);

            return ResponseEntity.ok(ApiResponse.success(avatarUrl, "Photo uploaded successfully"));
        } catch (Exception e) {
            log.error("Photo upload failed for user {}: {}", userDetails.getUsername(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("INTERNAL_ERROR", "Photo upload failed. Please try again."));
        }
    }
}
