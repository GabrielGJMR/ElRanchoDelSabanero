package com.ranchosabanero.backend.service;

import com.ranchosabanero.backend.dto.GalleryPhotoResponse;
import com.ranchosabanero.backend.dto.GallerySectionRequest;
import com.ranchosabanero.backend.dto.GallerySectionResponse;
import com.ranchosabanero.backend.entity.GalleryPhoto;
import com.ranchosabanero.backend.entity.GallerySection;
import com.ranchosabanero.backend.repository.GalleryPhotoRepository;
import com.ranchosabanero.backend.repository.GallerySectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Fotos del local para Inicio, agrupadas en secciones administrables (ver GallerySection). */
@Service
@RequiredArgsConstructor
public class GalleryService {

    private static final String FOLDER = "rancho/galeria";
    private static final int MAX_PHOTOS_PER_SECTION = 30;

    private final GallerySectionRepository sections;
    private final GalleryPhotoRepository photos;
    private final ImageStorage images;
    private final TranslationService translator;

    @Transactional(readOnly = true)
    public List<GallerySectionResponse> publicSections(String lang) {
        return sections.findAllByOrderByPositionAscIdAsc().stream()
                .map(s -> GallerySectionResponse.pub(s, lang, photosOf(s.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GallerySectionResponse> adminSections() {
        return sections.findAllByOrderByPositionAscIdAsc().stream()
                .map(s -> GallerySectionResponse.admin(s, photosOf(s.getId())))
                .toList();
    }

    private List<GalleryPhotoResponse> photosOf(Long sectionId) {
        return photos.findBySectionIdOrderByPositionAscIdAsc(sectionId).stream()
                .map(p -> new GalleryPhotoResponse(p.getId(), images.url(p.getImage())))
                .toList();
    }

    @Transactional
    public GallerySectionResponse createSection(GallerySectionRequest req) {
        GallerySection section = new GallerySection();
        section.setPosition(sections.countByIdNotNull());
        applySection(section, req);
        sections.save(section);
        return GallerySectionResponse.admin(section, List.of());
    }

    @Transactional
    public void renameSection(Long id, GallerySectionRequest req) {
        applySection(findSection(id), req);
    }

    @Transactional
    public void deleteSection(Long id) {
        GallerySection section = findSection(id);
        List<String> files = photos.findBySectionIdOrderByPositionAscIdAsc(id).stream()
                .map(GalleryPhoto::getImage).toList();
        sections.delete(section); // borra también sus fotos (ON DELETE CASCADE)
        files.forEach(images::delete);
    }

    @Transactional
    public GalleryPhotoResponse addPhoto(Long sectionId, MultipartFile file) {
        GallerySection section = findSection(sectionId);
        if (photos.countBySectionId(sectionId) >= MAX_PHOTOS_PER_SECTION) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta sección alcanzó el máximo de 30 fotos");
        }
        GalleryPhoto photo = new GalleryPhoto();
        photo.setSection(section);
        photo.setPosition(photos.countBySectionId(sectionId));
        photo.setImage(images.store(file, FOLDER));
        photos.save(photo);
        return new GalleryPhotoResponse(photo.getId(), images.url(photo.getImage()));
    }

    @Transactional
    public void deletePhoto(Long id) {
        GalleryPhoto photo = photos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foto no encontrada"));
        photos.delete(photo);
        images.delete(photo.getImage());
    }

    private void applySection(GallerySection section, GallerySectionRequest req) {
        String name = req.name().trim();
        String note = blankToNull(req.note());
        boolean nameChanged = !name.equals(section.getName());
        boolean noteChanged = !java.util.Objects.equals(note, section.getNote());

        section.setName(name);
        section.setNote(note);

        if (nameChanged) {
            TranslationService.Translations t = translator.translate(name);
            section.setNameEn(t.en());
            section.setNameFr(t.fr());
            section.setNameZh(t.zh());
        }
        if (noteChanged) {
            TranslationService.Translations t = translator.translate(note);
            section.setNoteEn(t.en());
            section.setNoteFr(t.fr());
            section.setNoteZh(t.zh());
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private GallerySection findSection(Long id) {
        return sections.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sección no encontrada"));
    }
}
