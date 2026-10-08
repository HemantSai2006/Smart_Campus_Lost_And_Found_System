package com.campus.lostfound.matching.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String authHeader = request.getHeader("Authorization");
                    if (authHeader != null && !authHeader.isBlank()) {
                        template.header("Authorization", authHeader);
                    }
                    String xUserId = request.getHeader("X-User-Id");
                    if (xUserId != null) {
                        template.header("X-User-Id", xUserId);
                    }
                    String xUserRole = request.getHeader("X-User-Role");
                    if (xUserRole != null) {
                        template.header("X-User-Role", xUserRole);
                    }
                    String xUserEmail = request.getHeader("X-User-Email");
                    if (xUserEmail != null) {
                        template.header("X-User-Email", xUserEmail);
                    }
                }
            }
        };
    }
}
