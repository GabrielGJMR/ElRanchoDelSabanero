package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Menu;

public record MenuResponse(Long id, String name) {

    public static MenuResponse from(Menu m) {
        return new MenuResponse(m.getId(), m.getName());
    }
}
