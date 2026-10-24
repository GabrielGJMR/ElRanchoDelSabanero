package com.ranchosabanero.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/**
 * Guarda las fotos subidas desde el panel en disco, bajo el volumen montado en {@code app.uploads.dir}.
 * El "public_id" que se guarda en la base de datos es la ruta relativa dentro de ese volumen; UploadsWebConfig
 * expone el volumen completo en /uploads/**.
 */
@Slf4j
@Component
@Profile("!test")
public class LocalFileImageStorage implements ImageStorage {

    private final Path root;

    public LocalFileImageStorage(@Value("${app.uploads.dir}") String uploadsDir) {
        this.root = Path.of(uploadsDir).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile file, String folder) {
        if (!"rancho/platillos".equals(folder) && !"rancho/galeria".equals(folder)) {
            throw new IllegalArgumentException("Carpeta de imágenes no permitida");
        }
        ImageValidation.Validated validated = ImageValidation.validate(file);
        String relativePath = folder + "/" + UUID.randomUUID() + "." + validated.extension();
        Path target = root.resolve(relativePath).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Ruta de imagen no permitida");
        }
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, validated.bytes());
        } catch (IOException e) {
            log.error("No se pudo guardar la imagen en {}", target, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la foto");
        }
        return relativePath;
    }

    @Override
    public void delete(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        Path target = root.resolve(relativePath).normalize();
        if (!target.startsWith(root)) {
            log.warn("Se rechazó una ruta de imagen fuera del almacenamiento configurado");
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("No se pudo borrar la foto {}", relativePath, e);
        }
    }

    @Override
    public String url(String relativePath) {
        return relativePath == null || relativePath.isBlank() ? null : "/uploads/" + relativePath;
    }
}
