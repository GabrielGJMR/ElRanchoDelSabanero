package com.ranchosabanero.backend.controller;

import com.ranchosabanero.backend.dto.CategoryRequest;
import com.ranchosabanero.backend.dto.ItemRequest;
import com.ranchosabanero.backend.dto.MenuCategoryResponse;
import com.ranchosabanero.backend.dto.MenuItemResponse;
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

    /** Menú completo, incluidos los platillos desactivados. También sirve para comprobar el login. */
    @GetMapping("/menu")
    public List<MenuCategoryResponse> menu() {
        return menuService.menu(false);
    }

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
}
