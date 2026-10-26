package com.campus.lostfound.item.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;
    private final boolean isCloudinaryConfigured;
    private final String uploadDir;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${file.upload-dir:uploads}") String uploadDir) {

        this.uploadDir = uploadDir;
        if (cloudName != null && !cloudName.isBlank() && !cloudName.equals("placeholder") &&
            apiKey != null && !apiKey.isBlank() &&
            apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret));
            this.isCloudinaryConfigured = true;
            log.info("Cloudinary configured successfully for cloud: {}", cloudName);
        } else {
            this.cloudinary = null;
            this.isCloudinaryConfigured = false;
            log.info("Cloudinary credentials not provided; using local storage fallback at: {}", uploadDir);
        }

        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            log.error("Failed to create upload directory", e);
        }
    }

    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (isCloudinaryConfigured && cloudinary != null) {
            try {
                @SuppressWarnings("rawtypes")
                Map result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", "smart-campus-lost-found",
                        "resource_type", "auto"
                ));
                return (String) result.get("secure_url");
            } catch (Exception e) {
                log.warn("Cloudinary upload failed, falling back to local file storage: {}", e.getMessage());
            }
        }

        // Local storage fallback
        try {
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path targetPath = Paths.get(uploadDir).resolve(fileName);
            Files.write(targetPath, file.getBytes());
            return "/api/items/images/" + fileName;
        } catch (IOException e) {
            log.error("Failed to save image locally", e);
            return null;
        }
    }

    public byte[] getImage(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            if (Files.exists(filePath)) {
                return Files.readAllBytes(filePath);
            }
        } catch (IOException e) {
            log.error("Failed to read local image file", e);
        }
        return null;
    }
}