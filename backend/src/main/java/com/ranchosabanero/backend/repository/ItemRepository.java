package com.ranchosabanero.backend.repository;

import com.ranchosabanero.backend.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findAllByOrderByPositionAscIdAsc();

    @Query("select coalesce(max(i.position), -1) + 1 from Item i where i.category.id = :categoryId")
    int nextPosition(@Param("categoryId") Long categoryId);
}
