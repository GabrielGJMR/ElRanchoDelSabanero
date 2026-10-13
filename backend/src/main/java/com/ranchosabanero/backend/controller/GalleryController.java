package com.ranchosabanero.backend.controller;

import com.ranchosabanero.backend.dto.GallerySectionResponse;
import com.ranchosabanero.backend.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Secciones de fotos del local para la portada (ver GallerySection). Público; para administrarlas ver AdminController. */
@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    /** @param lang "es" (por defecto), "en", "fr" o "zh" */
    @GetMapping
    public List<GallerySectionResponse> list(@RequestParam(defaultValue = "es") String lang) {
        return galleryService.publicSections(supportedLanguage(lang));
    }

    private static String supportedLanguage(String lang) {
        return switch (lang) {
            case "en", "fr", "zh" -> lang;
            default -> "es";
        };
    }
}
