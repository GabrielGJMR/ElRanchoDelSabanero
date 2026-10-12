package com.ranchosabanero.backend.repository;

import com.ranchosabanero.backend.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    List<Menu> findAllByOrderByPositionAscIdAsc();

    Optional<Menu> findBySlug(String slug);

    int countByIdNotNull();
}
