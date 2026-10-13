package com.ranchosabanero.backend.service;

import com.ranchosabanero.backend.dto.CreateUserRequest;
import com.ranchosabanero.backend.dto.UpdateUserRequest;
import com.ranchosabanero.backend.dto.UserResponse;
import com.ranchosabanero.backend.entity.AppUser;
import com.ranchosabanero.backend.entity.Role;
import com.ranchosabanero.backend.repository.AppUserRepository;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Usuarios del panel de administración. Ver Role para los permisos de cada rol. */
@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return users.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findByUsername(String username) {
        return UserResponse.from(users.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado")));
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest req) {
        if (users.existsByUsername(req.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese usuario ya existe");
        }
        AppUser u = new AppUser();
        u.setUsername(req.username());
        u.setPassword(encoder.encode(req.password()));
        u.setRole(req.role());
        u.setCreatedAt(Instant.now());
        return UserResponse.from(users.save(u));
    }

    @Transactional
    public void updateUser(Long id, UpdateUserRequest req) {
        AppUser u = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (u.getRole() == Role.ADMIN && req.role() != Role.ADMIN && users.countByRole(Role.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe quedar al menos un administrador");
        }
        u.setRole(req.role());
        if (req.password() != null && !req.password().isBlank()) {
            u.setPassword(encoder.encode(req.password()));
        }
    }

    @Transactional
    public void deleteUser(Long id, String currentUsername) {
        AppUser u = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (u.getUsername().equals(currentUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puede borrar su propio usuario");
        }
        if (u.getRole() == Role.ADMIN && users.countByRole(Role.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe quedar al menos un administrador");
        }
        users.delete(u);
    }
}
