package com.ranchosabanero.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.UUID;

/**
 * Guarda las fotos subidas desde el panel en una carpeta del disco (app.uploads-dir).
 * Nunca usa el nombre que manda el navegador: el tipo se detecta leyendo la imagen y el nombre es un UUID.
 */
@Slf4j
@Component
public class ImageStorage {

    private static final long MAX_PIXELS = 40_000_000L;

    private final Path dir;

    public ImageStorage(@Value("${app.uploads-dir}") String uploadsDir) throws IOException {
        this.dir = Path.of(uploadsDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
    }

    public Path directory() {
        return dir;
    }

    /** Valida que sea un JPG o PNG real y lo guarda. Devuelve el nombre del archivo. */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw bad("Seleccione una foto");
        }
        try {
            byte[] bytes = file.getBytes();
            try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
                Iterator<ImageReader> readers = in == null ? null : ImageIO.getImageReaders(in);
                if (readers == null || !readers.hasNext()) {
                    throw bad("El archivo no es una imagen válida. Use JPG o PNG.");
                }
                ImageReader reader = readers.next();
                try {
                    String format = reader.getFormatName().toLowerCase();
                    String extension = switch (format) {
                        case "jpeg", "jpg" -> ".jpg";
                        case "png" -> ".png";
                        default -> throw bad("Formato no permitido. Use JPG o PNG.");
                    };
                    reader.setInput(in);
                    if ((long) reader.getWidth(0) * reader.getHeight(0) > MAX_PIXELS) {
                        throw bad("La imagen es demasiado grande");
                    }
                    String name = UUID.randomUUID() + extension;
                    Files.write(dir.resolve(name), bytes);
                    return name;
                } finally {
                    reader.dispose();
                }
            }
        } catch (IOException e) {
            log.error("No se pudo guardar la imagen", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la foto");
        }
    }

    /** Borra una foto; ignora nombres sospechosos o archivos que ya no existen. */
    public void delete(String name) {
        if (name == null || name.isBlank()) {
            return;
        }
        Path file = dir.resolve(name).normalize();
        if (!file.startsWith(dir)) {
            return;
        }
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.warn("No se pudo borrar la foto {}", name, e);
        }
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
