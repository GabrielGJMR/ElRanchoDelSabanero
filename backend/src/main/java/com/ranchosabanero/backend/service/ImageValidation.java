package com.ranchosabanero.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Iterator;

/**
 * Valida que una foto subida sea un JPG o PNG real (nunca confía en el nombre ni el content-type que manda
 * el navegador: lee los bytes de la imagen). La usan tanto el storage real (Cloudinary) como el de pruebas.
 */
final class ImageValidation {

    private static final long MAX_PIXELS = 40_000_000L;

    private ImageValidation() {
    }

    record Validated(byte[] bytes, String extension) {
    }

    static Validated validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw bad("Seleccione una foto");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo leer la foto");
        }
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> readers = in == null ? null : ImageIO.getImageReaders(in);
            if (readers == null || !readers.hasNext()) {
                throw bad("El archivo no es una imagen válida. Use JPG o PNG.");
            }
            ImageReader reader = readers.next();
            try {
                String format = reader.getFormatName().toLowerCase();
                String extension = switch (format) {
                    case "jpeg", "jpg" -> "jpg";
                    case "png" -> "png";
                    default -> throw bad("Formato no permitido. Use JPG o PNG.");
                };
                reader.setInput(in);
                if ((long) reader.getWidth(0) * reader.getHeight(0) > MAX_PIXELS) {
                    throw bad("La imagen es demasiado grande");
                }
                return new Validated(bytes, extension);
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo leer la foto");
        }
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
