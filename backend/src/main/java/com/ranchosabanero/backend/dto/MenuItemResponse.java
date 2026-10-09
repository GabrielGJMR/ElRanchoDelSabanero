package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Item;
import com.ranchosabanero.backend.service.ImageStorage;

public record MenuItemResponse(Long id, String name, String description, int price, boolean available,
                               String imageUrl) {

    public static MenuItemResponse from(Item i, ImageStorage images) {
        return new MenuItemResponse(i.getId(), i.getName(), i.getDescription(), i.getPrice(), i.isAvailable(),
                images.url(i.getImage()));
    }
}
