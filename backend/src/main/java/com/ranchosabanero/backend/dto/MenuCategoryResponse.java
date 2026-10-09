package com.ranchosabanero.backend.dto;

import java.util.List;

public record MenuCategoryResponse(Long id, String name, String note, List<MenuItemResponse> items) {
}
