package com.ranchosabanero.backend.controller;

import com.ranchosabanero.backend.dto.GalleryPhotoResponse;
import com.ranchosabanero.backend.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Fotos del local para la portada. Público; para subir o borrar ver AdminController (/api/admin/gallery). */
@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping
    public List<GalleryPhotoResponse> list() {
        return galleryService.list();
    }
}
