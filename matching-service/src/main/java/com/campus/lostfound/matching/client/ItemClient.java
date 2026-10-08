package com.campus.lostfound.matching.client;

import com.campus.lostfound.matching.config.FeignClientConfig;
import com.campus.lostfound.matching.dto.ApiResponse;
import com.campus.lostfound.matching.dto.ItemDto;
import com.campus.lostfound.matching.dto.StatusUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "ITEM-SERVICE", configuration = FeignClientConfig.class)
public interface ItemClient {

    @GetMapping("/api/items/{id}")
    ApiResponse<ItemDto> getItemById(@PathVariable("id") Long id);

    @GetMapping("/api/items")
    ApiResponse<List<ItemDto>> getItems(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "color", required = false) String color,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "keyword", required = false) String keyword
    );

    @PutMapping("/api/items/{id}/status")
    ApiResponse<ItemDto> updateItemStatus(
            @PathVariable("id") Long id,
            @RequestBody StatusUpdateRequest request
    );
}