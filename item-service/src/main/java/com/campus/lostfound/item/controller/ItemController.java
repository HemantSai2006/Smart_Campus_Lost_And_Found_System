package com.campus.lostfound.item.controller;

import com.campus.lostfound.item.dto.*;
import com.campus.lostfound.item.entity.ItemStatus;
import com.campus.lostfound.item.entity.ItemType;
import com.campus.lostfound.item.security.UserPrincipal;
import com.campus.lostfound.item.service.CloudinaryService;
import com.campus.lostfound.item.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@Tag(name = "Item Management", description = "Endpoints for Lost & Found item reporting, CRUD, filtering, and admin management")
public class ItemController {

    private final ItemService itemService;
    private final CloudinaryService cloudinaryService;

    public ItemController(ItemService itemService, CloudinaryService cloudinaryService) {
        this.itemService = itemService;
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/lost")
    @Operation(summary = "Report a Lost item", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ItemResponse>> reportLostItem(
            @Valid @RequestBody CreateItemRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        ItemResponse created = itemService.createItem(request, ItemType.LOST, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Lost item reported successfully", created));
    }

    @PostMapping("/found")
    @Operation(summary = "Report a Found item", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ItemResponse>> reportFoundItem(
            @Valid @RequestBody CreateItemRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        ItemResponse created = itemService.createItem(request, ItemType.FOUND, principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Found item reported successfully", created));
    }

    @GetMapping
    @Operation(summary = "Search and filter items with optional criteria")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getItems(
            @RequestParam(value = "type", required = false) ItemType type,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "color", required = false) String color,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "status", required = false) ItemStatus status,
            @RequestParam(value = "keyword", required = false) String keyword) {

        List<ItemResponse> items = itemService.searchItems(type, category, location, date, color, brand, status, keyword);
        return ResponseEntity.ok(new ApiResponse<>(true, "Items retrieved successfully", items));
    }

    @GetMapping("/{id:[0-9]+}")
    @Operation(summary = "Get item by ID")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable("id") Long id) {
        ItemResponse item = itemService.getItemById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Item retrieved successfully", item));
    }

    @GetMapping("/{id:[0-9]+}/admin")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Get item by ID with private details for admin / claim-service", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<AdminItemResponse>> getItemByIdAdmin(@PathVariable("id") Long id) {
        AdminItemResponse item = itemService.getAdminItemById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin item details retrieved successfully", item));
    }

    @GetMapping("/my")
    @Operation(summary = "Get currently authenticated user's reported items", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getMyItems(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        List<ItemResponse> items = itemService.getUserItems(principal.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "User items retrieved successfully", items));
    }

    @PutMapping("/{id:[0-9]+}")
    @Operation(summary = "Update own reported item", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateItemRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        ItemResponse updated = itemService.updateItem(id, request, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Item updated successfully", updated));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @Operation(summary = "Delete item report (own report or Admin)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable("id") Long id,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName) {

        UserPrincipal principal = resolvePrincipal(authentication, headerUserId, headerUserRole, headerUserEmail, headerUserName);
        itemService.deleteItem(id, principal);
        return ResponseEntity.ok(new ApiResponse<>(true, "Item deleted successfully"));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Admin: List all items", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItemsAdmin() {
        List<ItemResponse> items = itemService.getAllItemsAdmin();
        return ResponseEntity.ok(new ApiResponse<>(true, "All items retrieved successfully for admin", items));
    }

    @DeleteMapping("/admin/{id:[0-9]+}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Admin: Remove an invalid report", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteItemAdmin(@PathVariable("id") Long id) {
        itemService.deleteItemAdmin(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Item removed by administrator"));
    }

    @PutMapping("/{id:[0-9]+}/status")
    @Operation(summary = "Update item status (internal / claim workflow)")
    public ResponseEntity<ApiResponse<ItemResponse>> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody StatusUpdateRequest request) {

        ItemResponse updated = itemService.updateStatus(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Item status updated successfully", updated));
    }

    @PostMapping("/upload-image")
    @Operation(summary = "Upload item image (Cloudinary or local storage fallback)")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "No file provided"));
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Image size exceeds the 5 MB limit"));
        }
        String contentType = file.getContentType();
        boolean isImage = contentType != null && contentType.startsWith("image/");
        boolean isPdf = "application/pdf".equalsIgnoreCase(contentType) ||
                (file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase().endsWith(".pdf"));
        if (!isImage && !isPdf) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Only JPG, PNG, WEBP images or PDF files are supported"));
        }
        String url = cloudinaryService.uploadImage(file);
        if (url == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Failed to upload image"));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Image uploaded successfully", url));
    }

    @GetMapping("/images/{filename}")
    @Operation(summary = "Retrieve locally stored item image")
    public ResponseEntity<byte[]> getImage(@PathVariable("filename") String filename) {
        byte[] data = cloudinaryService.getImage(filename);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = MediaType.IMAGE_JPEG;
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (lower.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else if (lower.endsWith(".pdf")) {
            mediaType = MediaType.APPLICATION_PDF;
        } else if (lower.endsWith(".gif")) {
            mediaType = MediaType.IMAGE_GIF;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(data);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard item statistics")
    public ResponseEntity<ApiResponse<ItemStatsResponse>> getStats() {
        ItemStatsResponse stats = itemService.getStats();
        return ResponseEntity.ok(new ApiResponse<>(true, "Stats retrieved successfully", stats));
    }

    private UserPrincipal resolvePrincipal(Authentication auth, Long headerId, String headerRole, String headerEmail, String headerName) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up;
        }
        if (headerId != null) {
            return new UserPrincipal(headerId, headerEmail != null ? headerEmail : "user@campus.edu", headerName != null ? headerName : "User", headerRole != null ? headerRole : "STUDENT");
        }
        return new UserPrincipal(1L, "student@campus.edu", "Campus Student", "STUDENT");
    }
}