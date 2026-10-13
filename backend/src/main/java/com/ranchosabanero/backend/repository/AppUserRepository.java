package com.ranchosabanero.backend.repository;

import com.ranchosabanero.backend.entity.AppUser;
import com.ranchosabanero.backend.entity.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);

    long countByRole(Role role);
}
