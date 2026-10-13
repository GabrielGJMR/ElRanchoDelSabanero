package com.ranchosabanero.backend.controller;

import com.ranchosabanero.backend.dto.CreateUserRequest;
import com.ranchosabanero.backend.dto.UpdateUserRequest;
import com.ranchosabanero.backend.dto.UserResponse;
import com.ranchosabanero.backend.service.AppUserService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * /api/admin/me es para cualquier usuario logueado (Admin o Editor): así el panel sabe qué rol
 * tiene quien entró. /api/admin/users/** es solo para Admin (ver SecurityConfig).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class UserController {

    private final AppUserService userService;

    @GetMapping("/me")
    public UserResponse me(Principal principal) {
        return userService.findByUsername(principal.getName());
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return userService.listUsers();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        userService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id, Principal principal) {
        userService.deleteUser(id, principal.getName());
    }
}
