package com.ranchosabanero.backend.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Reemplaza a CloudinaryImageStorage en las pruebas: no llama a la red, pero sí valida la imagen
 * igual que el storage real, para que las pruebas de "archivo inválido" sigan siendo reales.
 */
@Component
@Profile("test")
public class FakeImageStorage implements ImageStorage {

    @Override
    public String store(MultipartFile file, String folder) {
        ImageValidation.validate(file);
        return folder + "/test-" + UUID.randomUUID();
    }

    @Override
    public void delete(String publicId) {
        // nada que borrar: no se guarda en ningún lado de verdad
    }

    @Override
    public String url(String publicId) {
        return publicId == null ? null : "https://res.cloudinary.com/demo/image/upload/" + publicId;
    }
}
