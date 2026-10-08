package com.campus.lostfound.item.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI itemOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Item Service API")
                        .description("REST APIs for reporting, searching, filtering, and managing lost and found campus items")
                        .version("1.0.0"));
    }
}