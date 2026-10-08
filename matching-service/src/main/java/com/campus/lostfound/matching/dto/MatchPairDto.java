package com.campus.lostfound.matching.dto;

import java.util.List;

public class MatchPairDto {
    private ItemDto lostItem;
    private ItemDto foundItem;
    private int score;
    private List<String> matchReasons;

    public MatchPairDto() {}

    public MatchPairDto(ItemDto lostItem, ItemDto foundItem, int score, List<String> matchReasons) {
        this.lostItem = lostItem;
        this.foundItem = foundItem;
        this.score = score;
        this.matchReasons = matchReasons;
    }

    public ItemDto getLostItem() { return lostItem; }
    public void setLostItem(ItemDto lostItem) { this.lostItem = lostItem; }

    public ItemDto getFoundItem() { return foundItem; }
    public void setFoundItem(ItemDto foundItem) { this.foundItem = foundItem; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public List<String> getMatchReasons() { return matchReasons; }
    public void setMatchReasons(List<String> matchReasons) { this.matchReasons = matchReasons; }

    // Direct flat getters for MatchResponse compatibility
    public Long getLostItemId() { return lostItem != null ? lostItem.getId() : null; }
    public Long getFoundItemId() { return foundItem != null ? foundItem.getId() : null; }
    public String getItemName() { return foundItem != null ? foundItem.getName() : (lostItem != null ? lostItem.getName() : null); }
    public String getCategory() { return foundItem != null ? foundItem.getCategory() : (lostItem != null ? lostItem.getCategory() : null); }
    public String getLocation() { return foundItem != null ? foundItem.getLocation() : (lostItem != null ? lostItem.getLocation() : null); }
    public String getBrand() { return foundItem != null ? foundItem.getBrand() : (lostItem != null ? lostItem.getBrand() : null); }
    public String getColor() { return foundItem != null ? foundItem.getColor() : (lostItem != null ? lostItem.getColor() : null); }
    public String getMatchStatus() { return score >= 70 ? "POSSIBLE_MATCH" : "LOW_CONFIDENCE_MATCH"; }
}