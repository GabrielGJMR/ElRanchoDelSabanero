package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "El usuario es obligatorio") @Size(max = 50) String username,
        @NotBlank(message = "La clave es obligatoria") @Size(min = 12, max = 72, message = "La clave debe tener entre 12 y 72 caracteres") String password,
        @NotNull(message = "Falta el rol") Role role) {
}
