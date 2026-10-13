package com.ranchosabanero.backend.repository;

import com.ranchosabanero.backend.entity.GalleryPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GalleryPhotoRepository extends JpaRepository<GalleryPhoto, Long> {

    List<GalleryPhoto> findAllByOrderByPositionAscIdAsc();

    List<GalleryPhoto> findBySectionIdOrderByPositionAscIdAsc(Long sectionId);

    int countBySectionId(Long sectionId);
}
