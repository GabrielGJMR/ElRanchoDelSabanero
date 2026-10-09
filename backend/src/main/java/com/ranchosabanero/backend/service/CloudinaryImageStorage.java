package com.ranchosabanero.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

/** Guarda las fotos subidas desde el panel en Cloudinary. Nunca usa el nombre que manda el navegador. */
@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class CloudinaryImageStorage implements ImageStorage {

    private final Cloudinary cloudinary;

    @Override
    public String store(MultipartFile file, String folder) {
        ImageValidation.Validated validated = ImageValidation.validate(file);
        try {
            Map<?, ?> result = cloudinary.uploader().upload(validated.bytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image"));
            return (String) result.get("public_id");
        } catch (IOException e) {
            log.error("No se pudo subir la imagen a Cloudinary", e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo guardar la foto. Verifique las credenciales de Cloudinary.");
        }
    }

    @Override
    public void delete(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("No se pudo borrar la foto {} de Cloudinary", publicId, e);
        }
    }

    @Override
    public String url(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return null;
        }
        return cloudinary.url()
                .secure(true)
                .transformation(new Transformation().quality("auto").fetchFormat("auto"))
                .generate(publicId);
    }
}
