package com.ranchosabanero.backend.repository;

import com.ranchosabanero.backend.entity.GallerySection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GallerySectionRepository extends JpaRepository<GallerySection, Long> {

    List<GallerySection> findAllByOrderByPositionAscIdAsc();

    int countByIdNotNull();
}
