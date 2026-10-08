package com.campus.lostfound.matching.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MatchResultResponse {

    private Long lostItemId;
    private Long foundItemId;
    private int totalMatches;
    private List<MatchResponse> matches;

    public MatchResultResponse() {}

    public static MatchResultResponse forLostItem(Long lostItemId, List<MatchResponse> matches) {
        MatchResultResponse resp = new MatchResultResponse();
        resp.setLostItemId(lostItemId);
        resp.setMatches(matches);
        resp.setTotalMatches(matches != null ? matches.size() : 0);
        return resp;
    }

    public static MatchResultResponse forFoundItem(Long foundItemId, List<MatchResponse> matches) {
        MatchResultResponse resp = new MatchResultResponse();
        resp.setFoundItemId(foundItemId);
        resp.setMatches(matches);
        resp.setTotalMatches(matches != null ? matches.size() : 0);
        return resp;
    }

    public Long getLostItemId() { return lostItemId; }
    public void setLostItemId(Long lostItemId) { this.lostItemId = lostItemId; }

    public Long getFoundItemId() { return foundItemId; }
    public void setFoundItemId(Long foundItemId) { this.foundItemId = foundItemId; }

    public int getTotalMatches() { return totalMatches; }
    public void setTotalMatches(int totalMatches) { this.totalMatches = totalMatches; }

    public List<MatchResponse> getMatches() { return matches; }
    public void setMatches(List<MatchResponse> matches) { this.matches = matches; }
}
