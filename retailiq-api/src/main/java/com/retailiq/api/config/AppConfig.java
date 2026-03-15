package com.retailiq.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            java.nio.file.Path tempPath = java.nio.file.Paths.get("uploads", "temp");
            if (!java.nio.file.Files.exists(tempPath)) {
                java.nio.file.Files.createDirectories(tempPath);
            }
        } catch (java.io.IOException e) {
            e.printStackTrace();
        }
    }
}
