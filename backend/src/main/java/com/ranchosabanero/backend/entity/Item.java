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

    /** Precio en colones, sin I.V.A. */
    @Column(nullable = false)
    private int price;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private int position;

    /** public_id de la foto en Cloudinary; null si no tiene foto. */
    private String image;
}
