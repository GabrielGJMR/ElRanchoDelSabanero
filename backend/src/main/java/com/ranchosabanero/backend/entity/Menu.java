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
     * Identificador técnico y estable (p.ej. "eventos"), distinto del nombre visible que el
     * admin puede cambiar cuando quiera. NULL para los menús genéricos (la carta de comida,
     * todavía mezclados en un solo listado); solo los menús con slug tienen su propia página
     * pública (ver MenuController).
     */
    private String slug;

    @Column(nullable = false)
    private int position;
}
