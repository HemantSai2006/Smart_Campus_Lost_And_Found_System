package com.campus.lostfound.matching.client;

import com.campus.lostfound.matching.dto.ApiResponse;
import com.campus.lostfound.matching.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {

    @PostMapping("/api/notifications/internal")
    ApiResponse<Object> createNotification(@RequestBody NotificationRequest request);
}