package com.ranchosabanero.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GallerySectionRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100) String name,
        @Size(max = 300, message = "La nota no puede pasar de 300 caracteres") String note) {
}
