package com.campus.lostfound.item.service;

import com.campus.lostfound.item.dto.*;
import com.campus.lostfound.item.entity.Item;
import com.campus.lostfound.item.entity.ItemStatus;
import com.campus.lostfound.item.entity.ItemType;
import com.campus.lostfound.item.exception.BadRequestException;
import com.campus.lostfound.item.exception.ResourceNotFoundException;
import com.campus.lostfound.item.repository.ItemRepository;
import com.campus.lostfound.item.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public ItemResponse createItem(CreateItemRequest request, ItemType type, UserPrincipal principal) {
        Long userId = (principal != null && principal.getId() != null) ? principal.getId() : 1L;
        String userName = (principal != null && principal.getName() != null) ? principal.getName() : "Campus Student";
        String userEmail = (principal != null && principal.getEmail() != null) ? principal.getEmail() : "student@campus.edu";

        return createItemInternal(request, type, userId, userName, userEmail, null);
    }

    public ItemResponse createItem(CreateItemRequest request, ItemType type, Long userId, String userName, String userEmail, String userPhone) {
        return createItemInternal(request, type, userId, userName, userEmail, userPhone);
    }

    private ItemResponse createItemInternal(CreateItemRequest request, ItemType type, Long userId, String userName, String userEmail, String userPhone) {
        Item item = new Item();
        item.setType(type);
        item.setName(request.getName().trim());
        item.setCategory(request.getCategory().trim());
        item.setDescription(request.getDescription().trim());
        item.setDate(request.getDate());
        item.setLocation(request.getLocation().trim());
        item.setBrand(request.getBrand() != null && !request.getBrand().isBlank() ? request.getBrand().trim() : null);
        item.setColor(request.getColor() != null && !request.getColor().isBlank() ? request.getColor().trim() : null);
        item.setImageUrl(request.getImageUrl());
        item.setStatus(ItemStatus.REPORTED);
        item.setHighValue(request.isHighValue());
        if (request.getPrivateDetails() != null && !request.getPrivateDetails().isBlank()) {
            item.setPrivateDetails(request.getPrivateDetails().trim());
        }

        item.setUserId(userId != null ? userId : 1L);
        item.setReporterName(userName != null ? userName : "Campus Student");
        item.setReporterEmail(userEmail != null ? userEmail : "student@campus.edu");
        item.setReporterPhone(userPhone != null ? userPhone : null);

        Item saved = itemRepository.save(item);
        return mapToResponse(saved);
    }

    public List<ItemResponse> searchItems(
            ItemType type,
            String category,
            String location,
            LocalDate date,
            String color,
            String brand,
            ItemStatus status,
            String keyword) {

        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String cat = (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) ? category.trim() : null;
        String loc = (location != null && !location.isBlank() && !location.equalsIgnoreCase("ALL")) ? location.trim() : null;
        String col = (color != null && !color.isBlank()) ? color.trim() : null;
        String br = (brand != null && !brand.isBlank()) ? brand.trim() : null;

        return itemRepository.searchItems(type, cat, loc, date, col, br, status, kw).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return mapToResponse(item);
    }

    public List<ItemResponse> getUserItems(Long userId) {
        return itemRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse updateItem(Long id, UpdateItemRequest request, UserPrincipal principal) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        // Ownership and authorization check
        if (principal != null && !principal.isAdmin() && !item.getUserId().equals(principal.getId())) {
            throw new AccessDeniedException("You are not authorized to update this item report");
        }

        // Students can only update content fields; never userId, status, or type
        if (request.getName() != null && !request.getName().isBlank()) item.setName(request.getName().trim());
        if (request.getCategory() != null && !request.getCategory().isBlank()) item.setCategory(request.getCategory().trim());
        if (request.getDescription() != null && !request.getDescription().isBlank()) item.setDescription(request.getDescription().trim());
        if (request.getDate() != null) item.setDate(request.getDate());
        if (request.getLocation() != null && !request.getLocation().isBlank()) item.setLocation(request.getLocation().trim());
        if (request.getBrand() != null) item.setBrand(request.getBrand().trim());
        if (request.getColor() != null) item.setColor(request.getColor().trim());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());

        Item updated = itemRepository.save(item);
        return mapToResponse(updated);
    }

    public void deleteItem(Long id, UserPrincipal principal) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        // Ownership and authorization check
        if (principal != null && !principal.isAdmin() && !item.getUserId().equals(principal.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this item report");
        }

        itemRepository.delete(item);
    }

    public List<ItemResponse> getAllItemsAdmin() {
        return itemRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteItemAdmin(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        itemRepository.delete(item);
    }

    public ItemResponse updateStatus(Long id, StatusUpdateRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        item.setStatus(request.getStatus());
        Item updated = itemRepository.save(item);
        return mapToResponse(updated);
    }

    public ItemStatsResponse getStats() {
        long total = itemRepository.count();
        long lost = itemRepository.countByType(ItemType.LOST);
        long found = itemRepository.countByType(ItemType.FOUND);
        long matched = itemRepository.countByStatus(ItemStatus.MATCHED);
        long claimed = itemRepository.countByStatus(ItemStatus.CLAIMED);
        long returned = itemRepository.countByStatus(ItemStatus.RETURNED);

        return new ItemStatsResponse(total, lost, found, matched, claimed, returned);
    }

    public ItemResponse mapToResponse(Item item) {
        ItemResponse res = new ItemResponse();
        res.setId(item.getId());
        res.setType(item.getType());
        res.setName(item.getName());
        res.setCategory(item.getCategory());
        res.setDescription(item.getDescription());
        res.setDate(item.getDate());
        res.setLocation(item.getLocation());
        res.setBrand(item.getBrand());
        res.setColor(item.getColor());
        res.setImageUrl(item.getImageUrl());
        res.setStatus(item.getStatus());
        res.setUserId(item.getUserId());
        res.setReporterName(item.getReporterName());
        res.setReporterEmail(item.getReporterEmail());
        res.setReporterPhone(item.getReporterPhone());
        res.setHighValue(item.isHighValue());
        res.setCreatedAt(item.getCreatedAt());
        res.setUpdatedAt(item.getUpdatedAt());
        return res;
    }

    public AdminItemResponse getAdminItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        AdminItemResponse res = new AdminItemResponse();
        res.setId(item.getId());
        res.setType(item.getType());
        res.setName(item.getName());
        res.setCategory(item.getCategory());
        res.setDescription(item.getDescription());
        res.setDate(item.getDate());
        res.setLocation(item.getLocation());
        res.setBrand(item.getBrand());
        res.setColor(item.getColor());
        res.setImageUrl(item.getImageUrl());
        res.setStatus(item.getStatus());
        res.setUserId(item.getUserId());
        res.setReporterName(item.getReporterName());
        res.setReporterEmail(item.getReporterEmail());
        res.setReporterPhone(item.getReporterPhone());
        res.setHighValue(item.isHighValue());
        res.setPrivateDetails(item.getPrivateDetails());
        res.setCreatedAt(item.getCreatedAt());
        res.setUpdatedAt(item.getUpdatedAt());
        return res;
    }
}