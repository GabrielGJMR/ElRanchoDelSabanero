package com.ranchosabanero.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Fotos del local que se muestran en la portada ("Así es el rancho"), administrables desde el panel. */
@Entity
@Table(name = "gallery_photos")
@Getter
@Setter
@NoArgsConstructor
public class GalleryPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** public_id de la foto en Cloudinary. */
    @Column(nullable = false)
    private String image;

    @Column(nullable = false)
    private int position;
}
