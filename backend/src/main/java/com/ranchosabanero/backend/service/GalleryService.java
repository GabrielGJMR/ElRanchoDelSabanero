package com.ranchosabanero.backend.service;

import com.ranchosabanero.backend.dto.GalleryPhotoResponse;
import com.ranchosabanero.backend.entity.GalleryPhoto;
import com.ranchosabanero.backend.repository.GalleryPhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private static final String FOLDER = "rancho/galeria";
    private static final int MAX_PHOTOS = 30;

    private final GalleryPhotoRepository photos;
    private final ImageStorage images;

    @Transactional(readOnly = true)
    public List<GalleryPhotoResponse> list() {
        return photos.findAllByOrderByPositionAscIdAsc().stream()
                .map(p -> new GalleryPhotoResponse(p.getId(), images.url(p.getImage())))
                .toList();
    }

    @Transactional
    public GalleryPhotoResponse add(MultipartFile file) {
        if (photos.countByIdNotNull() >= MAX_PHOTOS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La galería alcanzó el máximo de 30 fotos");
        }
        GalleryPhoto photo = new GalleryPhoto();
        photo.setPosition(photos.countByIdNotNull());
        photo.setImage(images.store(file, FOLDER));
        photos.save(photo);
        return new GalleryPhotoResponse(photo.getId(), images.url(photo.getImage()));
    }

    @Transactional
    public void delete(Long id) {
        GalleryPhoto photo = photos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foto no encontrada"));
        photos.delete(photo);
        images.delete(photo.getImage());
    }
}
