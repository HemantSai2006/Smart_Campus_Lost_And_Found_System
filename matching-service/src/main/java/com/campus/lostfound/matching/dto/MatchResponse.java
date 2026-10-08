package com.campus.lostfound.matching.dto;

public class MatchResponse {

    private Long lostItemId;
    private Long foundItemId;
    private String itemName;
    private String category;
    private String location;
    private String brand;
    private String color;
    private int score;
    private String matchStatus;

    public MatchResponse() {}

    public MatchResponse(Long lostItemId, Long foundItemId, String itemName, String category,
                         String location, String brand, String color, int score, String matchStatus) {
        this.lostItemId = lostItemId;
        this.foundItemId = foundItemId;
        this.itemName = itemName;
        this.category = category;
        this.location = location;
        this.brand = brand;
        this.color = color;
        this.score = score;
        this.matchStatus = matchStatus;
    }

    public Long getLostItemId() { return lostItemId; }
    public void setLostItemId(Long lostItemId) { this.lostItemId = lostItemId; }

    public Long getFoundItemId() { return foundItemId; }
    public void setFoundItemId(Long foundItemId) { this.foundItemId = foundItemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getMatchStatus() { return matchStatus; }
    public void setMatchStatus(String matchStatus) { this.matchStatus = matchStatus; }
}
