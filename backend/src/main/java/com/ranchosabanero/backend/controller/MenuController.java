package com.ranchosabanero.backend.controller;

import com.ranchosabanero.backend.dto.MenuCategoryResponse;
import com.ranchosabanero.backend.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Menú público: no requiere login. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/menu")
    public List<MenuCategoryResponse> menu() {
        return menuService.menu(true);
    }
}
