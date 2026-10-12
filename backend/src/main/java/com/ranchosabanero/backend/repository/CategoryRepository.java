package com.ranchosabanero.backend.repository;

import com.ranchosabanero.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Para el menú público (la carta general): solo los menús sin slug propio, es decir los que
     * todavía no tienen su propia página (ver Menu.slug). Agrupa por menú primero, para que las
     * categorías de cada uno queden juntas.
     */
    List<Category> findAllByMenuSlugIsNullOrderByMenuIdAscPositionAscIdAsc();

    List<Category> findAllByMenuIdOrderByPositionAscIdAsc(Long menuId);

    int countByMenuId(Long menuId);
}
