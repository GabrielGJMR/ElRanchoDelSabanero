package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Menu;

public record MenuResponse(Long id, String name, String slug) {

    public static MenuResponse from(Menu m) {
        return new MenuResponse(m.getId(), m.getName(), m.getSlug());
    }
}
