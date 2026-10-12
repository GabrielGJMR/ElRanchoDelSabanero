package com.ranchosabanero.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.time.Duration;

/** Expone el volumen de fotos subidas (ver app.uploads.dir) como archivos estáticos en /uploads/**. */
@Configuration
public class UploadsWebConfig implements WebMvcConfigurer {

    private final String uploadsDir;

    public UploadsWebConfig(@Value("${app.uploads.dir:uploads}") String uploadsDir) {
        this.uploadsDir = uploadsDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Path.of(uploadsDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod((int) Duration.ofDays(1).toSeconds());
    }
}
