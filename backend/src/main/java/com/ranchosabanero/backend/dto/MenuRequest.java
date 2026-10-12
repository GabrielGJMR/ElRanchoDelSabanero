package com.ranchosabanero.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MenuRequest(@NotBlank(message = "El nombre es obligatorio") @Size(max = 100) String name) {
}
