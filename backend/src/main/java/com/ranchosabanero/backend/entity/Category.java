package com.ranchosabanero.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** A cuál de los tipos de menú (Menu) pertenece esta categoría. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_id")
    private Menu menu;

    @Column(nullable = false)
    private String name;

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
