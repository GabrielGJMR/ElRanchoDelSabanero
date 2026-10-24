package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.AppUser;
import com.ranchosabanero.backend.entity.Role;
import java.time.Instant;

/** Nunca incluye la clave (ni el hash). */
public record UserResponse(Long id, String username, Role role, Instant createdAt) {

    public static UserResponse from(AppUser u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getRole(), u.getCreatedAt());
    }
}
