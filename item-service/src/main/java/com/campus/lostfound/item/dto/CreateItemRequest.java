package com.campus.lostfound.item.dto;

import com.campus.lostfound.item.entity.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateItemRequest {

    private ItemType type;

    @NotBlank(message = "Item name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Location is required")
    private String location;

    private String brand;
    private String color;
    private String imageUrl;
    /** High-value flag (gold, laptop, phone, etc.) */
    private boolean highValue = false;
    /** Private identifying details — only for FOUND items, never shown publicly */
    private String privateDetails;

    public CreateItemRequest() {}

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

    public boolean isHighValue() { return highValue; }
    public void setHighValue(boolean highValue) { this.highValue = highValue; }

    public String getPrivateDetails() { return privateDetails; }
    public void setPrivateDetails(String privateDetails) { this.privateDetails = privateDetails; }
}
