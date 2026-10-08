package com.campus.lostfound.item.dto;

public class ItemStatsResponse {
    private long totalItems;
    private long lostItems;
    private long foundItems;
    private long matchedItems;
    private long claimedItems;
    private long returnedItems;

    public ItemStatsResponse() {}

    public ItemStatsResponse(long totalItems, long lostItems, long foundItems, long matchedItems, long claimedItems, long returnedItems) {
        this.totalItems = totalItems;
        this.lostItems = lostItems;
        this.foundItems = foundItems;
        this.matchedItems = matchedItems;
        this.claimedItems = claimedItems;
        this.returnedItems = returnedItems;
    }

    public long getTotalItems() { return totalItems; }
    public void setTotalItems(long totalItems) { this.totalItems = totalItems; }

    public long getLostItems() { return lostItems; }
    public void setLostItems(long lostItems) { this.lostItems = lostItems; }

    public long getFoundItems() { return foundItems; }
    public void setFoundItems(long foundItems) { this.foundItems = foundItems; }

    public long getMatchedItems() { return matchedItems; }
    public void setMatchedItems(long matchedItems) { this.matchedItems = matchedItems; }

    public long getClaimedItems() { return claimedItems; }
    public void setClaimedItems(long claimedItems) { this.claimedItems = claimedItems; }

    public long getReturnedItems() { return returnedItems; }
    public void setReturnedItems(long returnedItems) { this.returnedItems = returnedItems; }
}