package com.ranchosabanero.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Una sección de fotos del local en Inicio (ej. "Así es el rancho", "Nuestros platillos"). */
@Entity
@Table(name = "gallery_sections")
@Getter
@Setter
@NoArgsConstructor
public class GallerySection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** Texto corto opcional (ej. "Así preparamos cada plato a la leña"); si está, Inicio la muestra
     *  en un formato editorial con texto en vez de la grilla simple de fotos. */
    private String note;

    /** Traducciones automáticas (ver TranslationService); NULL si aún no se tradujo o el servicio no respondió. */
    @Column(name = "name_en")
    private String nameEn;
    @Column(name = "name_fr")
    private String nameFr;
    @Column(name = "name_zh")
    private String nameZh;
    @Column(name = "note_en")
    private String noteEn;
    @Column(name = "note_fr")
    private String noteFr;
    @Column(name = "note_zh")
    private String noteZh;

    @Column(nullable = false)
    private int position;
}
