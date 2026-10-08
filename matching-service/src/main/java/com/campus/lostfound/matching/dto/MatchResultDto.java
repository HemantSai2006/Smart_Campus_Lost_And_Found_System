package com.campus.lostfound.matching.dto;

import java.util.List;

public class MatchResultDto {
    private ItemDto targetItem;
    private ItemDto matchedItem;
    private int score;
    private boolean match;
    private List<String> matchReasons;

    public MatchResultDto() {}

    public MatchResultDto(ItemDto targetItem, ItemDto matchedItem, int score, boolean match, List<String> matchReasons) {
        this.targetItem = targetItem;
        this.matchedItem = matchedItem;
        this.score = score;
        this.match = match;
        this.matchReasons = matchReasons;
    }

    public ItemDto getTargetItem() { return targetItem; }
    public void setTargetItem(ItemDto targetItem) { this.targetItem = targetItem; }

    public ItemDto getMatchedItem() { return matchedItem; }
    public void setMatchedItem(ItemDto matchedItem) { this.matchedItem = matchedItem; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public boolean isMatch() { return match; }
    public void setMatch(boolean match) { this.match = match; }

    public List<String> getMatchReasons() { return matchReasons; }
    public void setMatchReasons(List<String> matchReasons) { this.matchReasons = matchReasons; }
}