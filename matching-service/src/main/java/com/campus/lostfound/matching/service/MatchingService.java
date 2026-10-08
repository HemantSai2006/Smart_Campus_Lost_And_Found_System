package com.campus.lostfound.matching.service;

import com.campus.lostfound.matching.client.ItemClient;
import com.campus.lostfound.matching.dto.*;
import com.campus.lostfound.matching.exception.BadRequestException;
import com.campus.lostfound.matching.exception.ResourceNotFoundException;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);

    public static final int THRESHOLD_POSSIBLE_MATCH = 70;
    public static final int THRESHOLD_LOW_CONFIDENCE = 50;

    public static final String STATUS_POSSIBLE_MATCH = "POSSIBLE_MATCH";
    public static final String STATUS_LOW_CONFIDENCE = "LOW_CONFIDENCE_MATCH";
    public static final String STATUS_NOT_A_MATCH = "NOT_A_MATCH";

    private final ItemClient itemClient;
    private final com.campus.lostfound.matching.client.NotificationClient notificationClient;

    public MatchingService(ItemClient itemClient, com.campus.lostfound.matching.client.NotificationClient notificationClient) {
        this.itemClient = itemClient;
        this.notificationClient = notificationClient;
    }

    /**
     * Find matches for a LOST item by comparing it against all FOUND items.
     */
    public MatchResultResponse findMatchesForLostItem(Long itemId, boolean updateStatusIfStrong) {
        ItemDto lostItem = fetchItem(itemId);

        if (!"LOST".equalsIgnoreCase(lostItem.getType())) {
            throw new BadRequestException("Item " + itemId + " is of type '" + lostItem.getType() + "', expected 'LOST'. Use /api/matching/found/" + itemId + " for FOUND items.");
        }

        List<ItemDto> foundItems = fetchItemsByType("FOUND");
        List<MatchResponse> matches = new ArrayList<>();

        for (ItemDto found : foundItems) {
            // Do not match item against itself if IDs collide
            if (Objects.equals(lostItem.getId(), found.getId())) {
                continue;
            }

            int score = calculateMatchScore(lostItem, found);
            if (score >= THRESHOLD_LOW_CONFIDENCE) {
                String matchStatus = score >= THRESHOLD_POSSIBLE_MATCH ? STATUS_POSSIBLE_MATCH : STATUS_LOW_CONFIDENCE;
                MatchResponse match = new MatchResponse(
                        lostItem.getId(),
                        found.getId(),
                        found.getName(),
                        found.getCategory(),
                        found.getLocation(),
                        found.getBrand(),
                        found.getColor(),
                        score,
                        matchStatus
                );
                matches.add(match);
            }
        }

        // Sort descending by score
        matches.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        // Send in-app notification to lost item owner if a strong match (>= 70) is detected
        if (!matches.isEmpty() && matches.get(0).getScore() >= THRESHOLD_POSSIBLE_MATCH && lostItem.getUserId() != null) {
            try {
                notificationClient.createNotification(new NotificationRequest(
                        lostItem.getUserId(),
                        "A possible match was found for your lost item: " + lostItem.getName(),
                        "POSSIBLE_MATCH",
                        matches.get(0).getFoundItemId()
                ));
            } catch (Exception e) {
                log.warn("Could not send match notification via Feign: {}", e.getMessage());
            }
        }

        // Optionally update item status to MATCHED if strong match exists
        if (updateStatusIfStrong && !matches.isEmpty() && matches.get(0).getScore() >= THRESHOLD_POSSIBLE_MATCH) {
            updateItemStatusToMatched(lostItem.getId());
            updateItemStatusToMatched(matches.get(0).getFoundItemId());
        }

        return MatchResultResponse.forLostItem(lostItem.getId(), matches);
    }

    /**
     * Reverse matching: Find matches for a FOUND item by comparing it against all LOST items.
     */
    public MatchResultResponse findMatchesForFoundItem(Long itemId, boolean updateStatusIfStrong) {
        ItemDto foundItem = fetchItem(itemId);

        if (!"FOUND".equalsIgnoreCase(foundItem.getType())) {
            throw new BadRequestException("Item " + itemId + " is of type '" + foundItem.getType() + "', expected 'FOUND'. Use /api/matching/" + itemId + " for LOST items.");
        }

        List<ItemDto> lostItems = fetchItemsByType("LOST");
        List<MatchResponse> matches = new ArrayList<>();

        for (ItemDto lost : lostItems) {
            if (Objects.equals(foundItem.getId(), lost.getId())) {
                continue;
            }

            int score = calculateMatchScore(lost, foundItem);
            if (score >= THRESHOLD_LOW_CONFIDENCE) {
                String matchStatus = score >= THRESHOLD_POSSIBLE_MATCH ? STATUS_POSSIBLE_MATCH : STATUS_LOW_CONFIDENCE;
                MatchResponse match = new MatchResponse(
                        lost.getId(),
                        foundItem.getId(),
                        lost.getName(),
                        lost.getCategory(),
                        lost.getLocation(),
                        lost.getBrand(),
                        lost.getColor(),
                        score,
                        matchStatus
                );
                matches.add(match);
            }
        }

        // Sort descending by score
        matches.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        if (updateStatusIfStrong && !matches.isEmpty() && matches.get(0).getScore() >= THRESHOLD_POSSIBLE_MATCH) {
            updateItemStatusToMatched(foundItem.getId());
            updateItemStatusToMatched(matches.get(0).getLostItemId());
        }

        return MatchResultResponse.forFoundItem(foundItem.getId(), matches);
    }

    /**
     * Find all possible matches across all active LOST and FOUND items.
     * Compares each LOST item against all FOUND items using existing scoring rules.
     * Returns match pairs with score >= 50, sorted descending by score.
     */
    public List<MatchPairDto> findAllMatches() {
        List<ItemDto> lostItems = fetchItemsByType("LOST");
        List<ItemDto> foundItems = fetchItemsByType("FOUND");
        List<MatchPairDto> allMatches = new ArrayList<>();

        for (ItemDto lost : lostItems) {
            if ("RETURNED".equalsIgnoreCase(lost.getStatus())) {
                continue;
            }
            for (ItemDto found : foundItems) {
                if ("RETURNED".equalsIgnoreCase(found.getStatus())) {
                    continue;
                }
                if (Objects.equals(lost.getId(), found.getId())) {
                    continue;
                }

                int score = calculateMatchScore(lost, found);
                if (score >= THRESHOLD_LOW_CONFIDENCE) {
                    List<String> reasons = getMatchReasons(lost, found);
                    MatchPairDto pair = new MatchPairDto(lost, found, score, reasons);
                    allMatches.add(pair);
                }
            }
        }

        allMatches.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));
        return allMatches;
    }

    private List<String> getMatchReasons(ItemDto lost, ItemDto found) {
        List<String> reasons = new ArrayList<>();
        if (calculateCategoryScore(lost.getCategory(), found.getCategory()) > 0) {
            reasons.add("Category Match (" + lost.getCategory() + ")");
        }
        if (calculateNameScore(lost.getName(), found.getName()) > 0) {
            reasons.add("Name Similarity");
        }
        if (calculateLocationScore(lost.getLocation(), found.getLocation()) > 0) {
            reasons.add("Location Proximity (" + lost.getLocation() + ")");
        }
        if (calculateBrandScore(lost.getBrand(), found.getBrand()) > 0) {
            reasons.add("Brand Match (" + lost.getBrand() + ")");
        }
        if (calculateColorScore(lost.getColor(), found.getColor()) > 0) {
            reasons.add("Color Match (" + lost.getColor() + ")");
        }
        return reasons;
    }

    /**
     * Updates an item's status to MATCHED in item-service via OpenFeign.
     * Decoupled as a separate method per requirement 9.
     */
    public boolean updateItemStatusToMatched(Long itemId) {
        try {
            StatusUpdateRequest updateReq = new StatusUpdateRequest("MATCHED", "Matched via Rule-Based Matching Service");
            ApiResponse<ItemDto> resp = itemClient.updateItemStatus(itemId, updateReq);
            return resp != null && resp.isSuccess();
        } catch (Exception e) {
            log.warn("Could not update item status to MATCHED for item {}: {}", itemId, e.getMessage());
            return false;
        }
    }

    /**
     * Core Rule-Based Scoring Function
     * Maximum: 100 points
     * 1. Name: 30
     * 2. Category: 20
     * 3. Location: 20
     * 4. Brand: 15
     * 5. Color: 15
     */
    public int calculateMatchScore(ItemDto item1, ItemDto item2) {
        int score = 0;

        // 1. Name Match (30 pts)
        score += calculateNameScore(item1.getName(), item2.getName());

        // 2. Category Match (20 pts)
        score += calculateCategoryScore(item1.getCategory(), item2.getCategory());

        // 3. Location Match (20 pts)
        score += calculateLocationScore(item1.getLocation(), item2.getLocation());

        // 4. Brand Match (15 pts)
        score += calculateBrandScore(item1.getBrand(), item2.getBrand());

        // 5. Color Match (15 pts)
        score += calculateColorScore(item1.getColor(), item2.getColor());

        return Math.min(score, 100);
    }

    private int calculateNameScore(String name1, String name2) {
        String n1 = normalize(name1);
        String n2 = normalize(name2);
        if (n1.isEmpty() || n2.isEmpty()) return 0;

        // Exact match
        if (n1.equals(n2)) {
            return 30;
        }

        // Substring / contains match (e.g. "Black HP Laptop" contains "HP Laptop")
        if (n1.contains(n2) || n2.contains(n1)) {
            return 30;
        }

        // Keyword overlap match
        Set<String> words1 = extractMeaningfulWords(n1);
        Set<String> words2 = extractMeaningfulWords(n2);
        if (words1.isEmpty() || words2.isEmpty()) return 0;

        int commonCount = 0;
        for (String w1 : words1) {
            for (String w2 : words2) {
                if (w1.equals(w2) || w1.contains(w2) || w2.contains(w1)) {
                    commonCount++;
                    break;
                }
            }
        }

        if (commonCount >= 2) return 30;
        if (commonCount == 1) return 15;
        return 0;
    }

    private int calculateCategoryScore(String cat1, String cat2) {
        String c1 = normalize(cat1);
        String c2 = normalize(cat2);
        if (c1.isEmpty() || c2.isEmpty()) return 0;

        return c1.equals(c2) ? 20 : 0;
    }

    private int calculateLocationScore(String loc1, String loc2) {
        String l1 = normalize(loc1);
        String l2 = normalize(loc2);
        if (l1.isEmpty() || l2.isEmpty()) return 0;

        if (l1.equals(l2) || l1.contains(l2) || l2.contains(l1)) {
            return 20;
        }
        return 0;
    }

    private int calculateBrandScore(String brand1, String brand2) {
        String b1 = normalize(brand1);
        String b2 = normalize(brand2);
        if (b1.isEmpty() || b2.isEmpty()) return 0;

        if (b1.equals(b2) || b1.contains(b2) || b2.contains(b1)) {
            return 15;
        }
        return 0;
    }

    private int calculateColorScore(String color1, String color2) {
        String c1 = normalize(color1);
        String c2 = normalize(color2);
        if (c1.isEmpty() || c2.isEmpty()) return 0;

        if (c1.equals(c2) || c1.contains(c2) || c2.contains(c1)) {
            return 15;
        }
        return 0;
    }

    private String normalize(String str) {
        if (str == null) return "";
        return str.trim().toLowerCase();
    }

    private Set<String> extractMeaningfulWords(String text) {
        Set<String> result = new HashSet<>();
        String[] tokens = text.replaceAll("[^a-zA-Z0-9 ]", "").split("\\s+");
        Set<String> stopWords = Set.of("the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "my", "is", "of");
        for (String token : tokens) {
            if (token.length() >= 2 && !stopWords.contains(token)) {
                result.add(token);
            }
        }
        return result;
    }

    private ItemDto fetchItem(Long itemId) {
        try {
            ApiResponse<ItemDto> resp = itemClient.getItemById(itemId);
            if (resp == null || resp.getData() == null) {
                throw new ResourceNotFoundException("Item not found with id: " + itemId);
            }
            return resp.getData();
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("Item not found with id: " + itemId);
        }
    }

    private List<ItemDto> fetchItemsByType(String type) {
        try {
            ApiResponse<List<ItemDto>> resp = itemClient.getItems(type, null, null, null, null, null, null);
            if (resp != null && resp.getData() != null) {
                return resp.getData();
            }
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Error fetching items of type {}: {}", type, e.getMessage());
            return Collections.emptyList();
        }
    }
}