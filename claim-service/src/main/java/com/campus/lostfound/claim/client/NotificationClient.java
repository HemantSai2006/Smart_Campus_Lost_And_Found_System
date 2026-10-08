package com.campus.lostfound.claim.client;

import com.campus.lostfound.claim.dto.ApiResponse;
import com.campus.lostfound.claim.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {

    @PostMapping("/api/notifications/internal")
    ApiResponse<Object> createNotification(@RequestBody NotificationRequest request);
}