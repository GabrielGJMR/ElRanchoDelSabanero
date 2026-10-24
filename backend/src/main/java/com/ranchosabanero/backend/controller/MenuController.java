package com.ranchosabanero.backend.controller;

import com.ranchosabanero.backend.dto.MenuCategoryResponse;
import com.ranchosabanero.backend.dto.MenuResponse;
import com.ranchosabanero.backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Menú público: no requiere login. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    /** @param lang "es" (por defecto), "en", "fr" o "zh" */
    @GetMapping("/menu")
    public List<MenuCategoryResponse> menu(@RequestParam(defaultValue = "es") String lang) {
        return menuService.menu(true, supportedLanguage(lang));
    }

    /** Menú con página propia (por ahora solo "eventos"). @param lang "es" (por defecto), "en", "fr" o "zh" */
    @GetMapping("/menu/{slug}")
    public List<MenuCategoryResponse> menuBySlug(@PathVariable String slug, @RequestParam(defaultValue = "es") String lang) {
        return menuService.publicMenuBySlug(slug, supportedLanguage(lang));
    }

    /** Los 3 menús de comida (Menú Principal, Casados, Desayunos), para las pestañas de /menu. */
    @GetMapping("/menus")
    public List<MenuResponse> menuTypes() {
        return menuService.publicMenuTypes();
    }

    private static String supportedLanguage(String lang) {
        return switch (lang) {
            case "en", "fr", "zh" -> lang;
            default -> "es";
        };
    }
}
