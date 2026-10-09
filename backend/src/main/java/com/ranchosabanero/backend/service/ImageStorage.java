package com.ranchosabanero.backend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Dónde viven las fotos (platillos y galería del local). La implementación real sube a Cloudinary;
 * en las pruebas se reemplaza por {@code FakeImageStorage} para no depender de la red.
 */
public interface ImageStorage {

    /** Valida y guarda la foto en la carpeta indicada. Devuelve el public_id para guardar en la base de datos. */
    String store(MultipartFile file, String folder);

    /** Borra una foto; no falla si ya no existe. */
    void delete(String publicId);

    /** URL pública (optimizada) de una foto, o null si publicId es null. */
    String url(String publicId);
}
