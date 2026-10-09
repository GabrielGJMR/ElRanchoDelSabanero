package com.ranchosabanero.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Sirve para crear (requiere categoryId) y para editar un platillo (categoryId se ignora). */
public record ItemRequest(
        Long categoryId,
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 120) String name,
        @Size(max = 300) String description,
        @NotNull(message = "El precio es obligatorio") @Min(value = 0, message = "El precio no puede ser negativo") Integer price,
        Boolean available) {
}
