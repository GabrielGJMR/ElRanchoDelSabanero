package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Item;
import com.ranchosabanero.backend.service.ImageStorage;

public record MenuItemResponse(Long id, String name, String description, int price, boolean available,
                               String imageUrl) {

    /** @param lang "es" (por defecto), "en", "fr" o "zh"; si falta la traducción, cae de vuelta al español. */
    public static MenuItemResponse from(Item i, ImageStorage images, String lang) {
        return new MenuItemResponse(i.getId(),
                pick(lang, i.getName(), i.getNameEn(), i.getNameFr(), i.getNameZh()),
                pick(lang, i.getDescription(), i.getDescriptionEn(), i.getDescriptionFr(), i.getDescriptionZh()),
                i.getPrice(), i.isAvailable(), images.url(i.getImage()));
    }

    static String pick(String lang, String es, String en, String fr, String zh) {
        String translated = switch (lang) {
            case "en" -> en;
            case "fr" -> fr;
            case "zh" -> zh;
            default -> es;
        };
        return translated != null ? translated : es;
    }
}
