package com.ranchosabanero.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Una foto del local, dentro de una sección (ver GallerySection), administrable desde el panel. */
@Entity
@Table(name = "gallery_photos")
@Getter
@Setter
@NoArgsConstructor
public class GalleryPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "section_id")
    private GallerySection section;

    /** Ruta relativa de la foto dentro del volumen de uploads. */
    @Column(nullable = false)
    private String image;

    @Column(nullable = false)
    private int position;
}
