package com.campus.lostfound.claim.client;

import com.campus.lostfound.claim.config.FeignClientConfig;
import com.campus.lostfound.claim.dto.ApiResponse;
import com.campus.lostfound.claim.dto.ItemDto;
import com.campus.lostfound.claim.dto.StatusUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ITEM-SERVICE", configuration = FeignClientConfig.class)
public interface ItemClient {

    @GetMapping("/api/items/{id}")
    ApiResponse<ItemDto> getItemById(@PathVariable("id") Long id);

    /**
     * Admin-only endpoint: returns item with privateDetails included.
     * Used by claim-service to show finder's private identifying info to admins during verification.
     */
    @GetMapping("/api/items/{id}/admin")
    ApiResponse<ItemDto> getItemByIdAdmin(@PathVariable("id") Long id);

    @PutMapping("/api/items/{id}/status")
    ApiResponse<Object> updateItemStatus(@PathVariable("id") Long id, @RequestBody StatusUpdateRequest request);
}