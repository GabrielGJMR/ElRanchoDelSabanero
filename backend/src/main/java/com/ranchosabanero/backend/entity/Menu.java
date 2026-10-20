package com.ranchosabanero.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Uno de los tipos de menú del restaurante (p.ej. "Menú 1", "Menú 2", "Menú 3"); cada uno agrupa sus propias categorías. */
@Entity
@Table(name = "menus")
@Getter
@Setter
@NoArgsConstructor
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /**
     * Identificador técnico y estable (p.ej. "eventos", "principal"), distinto del nombre
     * visible que el admin puede cambiar cuando quiera. Un menú nuevo creado desde el admin
     * nace sin slug y no aparece en /api/menus hasta que se le asigne uno (ver MenuController).
     */
    private String slug;

    @Column(nullable = false)
    private int position;
}
