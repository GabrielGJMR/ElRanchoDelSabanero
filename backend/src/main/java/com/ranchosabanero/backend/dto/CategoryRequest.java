package com.ranchosabanero.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotNull(message = "Falta el menú") Long menuId,
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100) String name,
        @Size(max = 300) String note) {
}
