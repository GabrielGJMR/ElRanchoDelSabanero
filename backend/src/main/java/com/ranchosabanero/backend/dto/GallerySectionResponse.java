package com.ranchosabanero.backend.dto;

import com.ranchosabanero.backend.entity.GallerySection;

import java.util.List;

public record GallerySectionResponse(Long id, String name, String note, List<GalleryPhotoResponse> photos) {

    /** Para el admin: siempre el nombre/nota en español, como lo escribió quien lo creó. */
    public static GallerySectionResponse admin(GallerySection s, List<GalleryPhotoResponse> photos) {
        return new GallerySectionResponse(s.getId(), s.getName(), s.getNote(), photos);
    }

    /** Para el público: en el idioma pedido; si falta la traducción, cae de vuelta al español. */
    public static GallerySectionResponse pub(GallerySection s, String lang, List<GalleryPhotoResponse> photos) {
        return new GallerySectionResponse(s.getId(),
                MenuItemResponse.pick(lang, s.getName(), s.getNameEn(), s.getNameFr(), s.getNameZh()),
                MenuItemResponse.pick(lang, s.getNote(), s.getNoteEn(), s.getNoteFr(), s.getNoteZh()),
                photos);
    }
}
