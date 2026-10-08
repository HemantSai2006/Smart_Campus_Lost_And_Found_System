package com.campus.lostfound.matching.controller;

import com.campus.lostfound.matching.dto.ApiResponse;
import com.campus.lostfound.matching.dto.MatchResultResponse;
import com.campus.lostfound.matching.service.MatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matching")
@Tag(name = "Matching Engine", description = "Rule-based scoring service to detect matches between lost and found items")
@SecurityRequirement(name = "bearerAuth")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/{itemId:[0-9]+}")
    @Operation(summary = "Find possible matches for a LOST item", description = "Retrieves a LOST item from Item Service and scores candidate FOUND items. Returns matches with score >= 50.")
    public ResponseEntity<ApiResponse<MatchResultResponse>> getMatchesForLostItem(
            @PathVariable("itemId") Long itemId,
            @RequestParam(value = "updateStatus", defaultValue = "false") boolean updateStatus) {

        MatchResultResponse result = matchingService.findMatchesForLostItem(itemId, updateStatus);
        String msg = result.getMatches().isEmpty()
                ? "No matching items found with confidence score >= 50"
                : "Found " + result.getMatches().size() + " possible match(es)";
        return ResponseEntity.ok(new ApiResponse<>(true, msg, result));
    }

    @GetMapping("/found/{itemId:[0-9]+}")
    @Operation(summary = "Reverse matching for a FOUND item", description = "Retrieves a FOUND item from Item Service and scores candidate LOST items. Returns matches with score >= 50.")
    public ResponseEntity<ApiResponse<MatchResultResponse>> getMatchesForFoundItem(
            @PathVariable("itemId") Long itemId,
            @RequestParam(value = "updateStatus", defaultValue = "false") boolean updateStatus) {

        MatchResultResponse result = matchingService.findMatchesForFoundItem(itemId, updateStatus);
        String msg = result.getMatches().isEmpty()
                ? "No matching items found with confidence score >= 50"
                : "Found " + result.getMatches().size() + " possible match(es)";
        return ResponseEntity.ok(new ApiResponse<>(true, msg, result));
    }

    @GetMapping("/all")
    @Operation(summary = "Find all possible matches across all lost and found items", description = "Compares all active LOST items against all active FOUND items and returns matches with score >= 50 sorted descending.")
    public ResponseEntity<ApiResponse<java.util.List<com.campus.lostfound.matching.dto.MatchPairDto>>> getAllMatches() {
        java.util.List<com.campus.lostfound.matching.dto.MatchPairDto> matches = matchingService.findAllMatches();
        String msg = matches.isEmpty()
                ? "No matching items found with confidence score >= 50"
                : "Found " + matches.size() + " possible match pair(s)";
        return ResponseEntity.ok(new ApiResponse<>(true, msg, matches));
    }

    @PostMapping("/{lostItemId:[0-9]+}/confirm-match/{foundItemId:[0-9]+}")
    @Operation(summary = "Confirm match between lost and found items", description = "Updates item status to MATCHED in Item Service for both items")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmMatch(
            @PathVariable("lostItemId") Long lostItemId,
            @PathVariable("foundItemId") Long foundItemId) {

        boolean lostUpdated = matchingService.updateItemStatusToMatched(lostItemId);
        boolean foundUpdated = matchingService.updateItemStatusToMatched(foundItemId);

        Map<String, Object> data = Map.of(
                "lostItemId", lostItemId,
                "foundItemId", foundItemId,
                "lostItemUpdated", lostUpdated,
                "foundItemUpdated", foundUpdated,
                "status", "MATCHED"
        );

        return ResponseEntity.ok(new ApiResponse<>(true, "Items marked as MATCHED successfully", data));
    }

    @GetMapping("/rules")
    @Operation(summary = "Get matching algorithm scoring rules (Viva reference)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMatchingRules() {
        Map<String, Object> rules = Map.of(
                "maxScore", 100,
                "weights", Map.of(
                        "nameMatch", 30,
                        "categoryMatch", 20,
                        "locationMatch", 20,
                        "brandMatch", 15,
                        "colorMatch", 15
                ),
                "thresholds", Map.of(
                        "POSSIBLE_MATCH", ">= 70 points",
                        "LOW_CONFIDENCE_MATCH", "50 - 69 points",
                        "NOT_A_MATCH", "< 50 points (filtered out)"
                ),
                "normalization", "lowercase, whitespace trimmed, null-safe, substring and tokenized word matching"
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Rule-based matching algorithm specifications", rules));
    }
}