package com.ranchosabanero.backend.entity;

/**
 * ADMIN: acceso total (incluye gestionar usuarios y la estructura de menús: crear/renombrar/borrar
 * menús y categorías). EDITOR: solo el contenido del día a día (platillos, precios, disponibilidad,
 * fotos de platillos y de la galería); no puede borrar categorías/menús ni gestionar usuarios.
 */
public enum Role {
    ADMIN,
    EDITOR,
}
