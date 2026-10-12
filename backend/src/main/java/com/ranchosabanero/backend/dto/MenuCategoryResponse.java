package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Category;

import java.util.List;

public record MenuCategoryResponse(Long id, String name, String note, List<MenuItemResponse> items) {

    /** @param lang "es" (por defecto), "en", "fr" o "zh"; si falta la traducción, cae de vuelta al español. */
    public static MenuCategoryResponse from(Category c, String lang, List<MenuItemResponse> items) {
        return new MenuCategoryResponse(c.getId(),
                MenuItemResponse.pick(lang, c.getName(), c.getNameEn(), c.getNameFr(), c.getNameZh()),
                MenuItemResponse.pick(lang, c.getNote(), c.getNoteEn(), c.getNoteFr(), c.getNoteZh()),
                items);
    }
}
