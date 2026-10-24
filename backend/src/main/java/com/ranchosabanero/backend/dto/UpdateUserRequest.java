package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.Role;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** password es opcional: si viene vacío o ausente, no se cambia la clave actual (ver AppUserService). */
public record UpdateUserRequest(@Size(min = 12, max = 72, message = "La clave debe tener entre 12 y 72 caracteres") String password,
                                @NotNull(message = "Falta el rol") Role role) {
}
