package com.ranchosabanero.backend.repository;

import com.ranchosabanero.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByMenuIdOrderByPositionAscIdAsc(Long menuId);

    int countByMenuId(Long menuId);
}
