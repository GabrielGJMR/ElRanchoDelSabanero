package com.ranchosabanero.backend.controller;

import com.ranchosabanero.backend.dto.CategoryRequest;
import com.ranchosabanero.backend.dto.GalleryPhotoResponse;
import com.ranchosabanero.backend.dto.GallerySectionRequest;
import com.ranchosabanero.backend.dto.GallerySectionResponse;
import com.ranchosabanero.backend.dto.ItemRequest;
import com.ranchosabanero.backend.dto.MenuCategoryResponse;
import com.ranchosabanero.backend.dto.MenuItemResponse;
import com.ranchosabanero.backend.dto.MenuRequest;
import com.ranchosabanero.backend.dto.MenuResponse;
import com.ranchosabanero.backend.service.GalleryService;
import com.ranchosabanero.backend.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** Todas las rutas /api/admin/** exigen login (ver SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MenuService menuService;
    private final GalleryService galleryService;

    // ---- Tipos de menú ----
    // Elegir el menú es el primer paso tras iniciar sesión: GET /menus también sirve para
    // comprobar el login (si el usuario/clave son válidos, aunque todavía no haya menús).

    @GetMapping("/menus")
    public List<MenuResponse> menus() {
        return menuService.listMenus();
    }

    @PostMapping("/menus")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuResponse createMenu(@Valid @RequestBody MenuRequest request) {
        return menuService.createMenu(request);
    }

    @PutMapping("/menus/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void renameMenu(@PathVariable Long id, @Valid @RequestBody MenuRequest request) {
        menuService.renameMenu(id, request);
    }

    @DeleteMapping("/menus/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
    }

    /** Categorías (incluidos los platillos desactivados) de un solo tipo de menú. */
    @GetMapping("/menus/{menuId}/categories")
    public List<MenuCategoryResponse> categoriesForMenu(@PathVariable Long menuId) {
        return menuService.categoriesForMenu(menuId, false, "es");
    }

    // ---- Categorías ----

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuCategoryResponse createCategory(@Valid @RequestBody CategoryRequest request) {
        return menuService.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        menuService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        menuService.deleteCategory(id);
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItemResponse createItem(@Valid @RequestBody ItemRequest request) {
        return menuService.createItem(request);
    }

    @PutMapping("/items/{id}")
    public MenuItemResponse updateItem(@PathVariable Long id, @Valid @RequestBody ItemRequest request) {
        return menuService.updateItem(id, request);
    }

    @PostMapping(value = "/items/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MenuItemResponse uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return menuService.setImage(id, file);
    }

    @DeleteMapping("/items/{id}/image")
    public MenuItemResponse removeImage(@PathVariable Long id) {
        return menuService.removeImage(id);
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        menuService.deleteItem(id);
    }

    // ---- Secciones de fotos del local (Inicio) ----
    // Crear/renombrar/borrar secciones es solo para Admin (ver SecurityConfig); subir/borrar fotos
    // dentro de una sección existente es para Admin y Editor.

    @GetMapping("/gallery/sections")
    public List<GallerySectionResponse> gallerySections() {
        return galleryService.adminSections();
    }

    @PostMapping("/gallery/sections")
    @ResponseStatus(HttpStatus.CREATED)
    public GallerySectionResponse createGallerySection(@Valid @RequestBody GallerySectionRequest request) {
        return galleryService.createSection(request);
    }

    @PutMapping("/gallery/sections/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void renameGallerySection(@PathVariable Long id, @Valid @RequestBody GallerySectionRequest request) {
        galleryService.renameSection(id, request);
    }

    @DeleteMapping("/gallery/sections/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGallerySection(@PathVariable Long id) {
        galleryService.deleteSection(id);
    }

    @PostMapping(value = "/gallery/sections/{sectionId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public GalleryPhotoResponse addGalleryPhoto(@PathVariable Long sectionId, @RequestParam("file") MultipartFile file) {
        return galleryService.addPhoto(sectionId, file);
    }

    @DeleteMapping("/gallery/photos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGalleryPhoto(@PathVariable Long id) {
        galleryService.deletePhoto(id);
    }
}
