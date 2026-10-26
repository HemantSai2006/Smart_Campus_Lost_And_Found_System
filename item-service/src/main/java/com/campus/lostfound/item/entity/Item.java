package com.campus.lostfound.item.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type; // LOST or FOUND

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // Electronics, Bags, Documents/Cards, Keys, Books, Clothing, Others

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDate date; // Date lost or date found

    @Column(nullable = false)
    private String location; // Library, Cafeteria, CSE Block, etc.

    private String brand;
    private String color;

    /** True for valuable items: gold ornaments, laptops, phones, etc. */
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean highValue = false;

    /**
     * Private identifying details entered by the FINDER (e.g., engravings, scratches, serial numbers).
     * NEVER returned in public-facing API responses — only via admin-only endpoint.
     */
    @Column(columnDefinition = "TEXT")
    private String privateDetails;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status = ItemStatus.REPORTED;

    @Column(nullable = false)
    private Long userId;

    private String reporterName;
    private String reporterEmail;
    private String reporterPhone;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Item() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ItemStatus.REPORTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    public String getPrivateDetails() { return privateDetails; }
    public void setPrivateDetails(String privateDetails) { this.privateDetails = privateDetails; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}