package com.ranchosabanero.backend.service;

import com.ranchosabanero.backend.entity.AppUser;
import com.ranchosabanero.backend.entity.Role;
import com.ranchosabanero.backend.repository.AppUserRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea el primer usuario administrador (desde ADMIN_USER/ADMIN_PASSWORD) solo si la tabla
 * app_users está vacía, es decir solo la primerísima vez que arranca el backend. Después de eso
 * los usuarios se gestionan desde el panel (pestaña "Usuarios"), y estas variables de entorno ya
 * no se vuelven a leer: así un restart no pisa la clave que el admin haya cambiado desde la web.
 */
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final Environment environment;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() > 0) {
            return;
        }

        String password = adminPassword;
        if (password == null || password.isBlank()) {
            if (environment.acceptsProfiles(Profiles.of("prod"))) {
                throw new IllegalStateException("En producción debe definir la variable ADMIN_PASSWORD");
            }
            byte[] bytes = new byte[9];
            new SecureRandom().nextBytes(bytes);
            password = HexFormat.of().formatHex(bytes);
            log.warn("ADMIN_PASSWORD no está definido. Clave temporal del panel de administración: {}", password);
        }

        AppUser admin = new AppUser();
        admin.setUsername(adminUsername);
        admin.setPassword(encoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(Instant.now());
        users.save(admin);
        log.info("Usuario administrador inicial creado: {}", adminUsername);
    }
}
