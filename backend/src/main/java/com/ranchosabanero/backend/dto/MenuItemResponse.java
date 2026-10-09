package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Item;

public record MenuItemResponse(Long id, String name, String description, int price, boolean available) {

    public static MenuItemResponse from(Item i) {
        return new MenuItemResponse(i.getId(), i.getName(), i.getDescription(), i.getPrice(), i.isAvailable());
    }
}
