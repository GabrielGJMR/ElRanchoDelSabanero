package com.ranchosabanero.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String name;

    private String description;

    /** Traducciones automáticas (ver TranslationService); NULL si aún no se tradujo o el servicio no respondió. */
    @Column(name = "name_en")
    private String nameEn;
    @Column(name = "name_fr")
    private String nameFr;
    @Column(name = "name_zh")
    private String nameZh;
    @Column(name = "description_en")
    private String descriptionEn;
    @Column(name = "description_fr")
    private String descriptionFr;
    @Column(name = "description_zh")
    private String descriptionZh;

    /** Precio en colones, sin I.V.A. */
    @Column(nullable = false)
    private int price;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private int position;

    /** Ruta relativa de la foto dentro del volumen de uploads; null si no tiene foto. */
    private String image;
}
