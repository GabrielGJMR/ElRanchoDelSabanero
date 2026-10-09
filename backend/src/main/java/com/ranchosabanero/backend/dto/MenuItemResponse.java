package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Item;

public record MenuItemResponse(Long id, String name, String description, int price, boolean available,
                               String imageUrl) {

    public static MenuItemResponse from(Item i) {
        String imageUrl = i.getImage() == null ? null : "/uploads/" + i.getImage();
        return new MenuItemResponse(i.getId(), i.getName(), i.getDescription(), i.getPrice(), i.isAvailable(),
                imageUrl);
    }
}
