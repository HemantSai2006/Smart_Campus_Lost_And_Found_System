package com.campus.lostfound.item.dto;

import com.campus.lostfound.item.entity.ItemStatus;
import com.campus.lostfound.item.entity.ItemType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ItemResponse {
    private Long id;
    private ItemType type;
    private String name;
    private String category;
    private String description;
    private LocalDate date;
    private String location;
    private String brand;
    private String color;
    private String imageUrl;
    private ItemStatus status;
    private Long userId;
    private String reporterName;
    private String reporterEmail;
    private String reporterPhone;
    private boolean highValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ItemResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ItemType getType() { return type; }
    public void setType(ItemType type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public ItemStatus getStatus() { return status; }
    public void setStatus(ItemStatus status) { this.status = status; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public boolean isHighValue() { return highValue; }
    public void setHighValue(boolean highValue) { this.highValue = highValue; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}