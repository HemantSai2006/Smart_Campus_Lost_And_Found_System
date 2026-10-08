package com.campus.lostfound.item.repository;

import com.campus.lostfound.item.entity.Item;
import com.campus.lostfound.item.entity.ItemStatus;
import com.campus.lostfound.item.entity.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Item> findByTypeOrderByCreatedAtDesc(ItemType type);

    List<Item> findAllByOrderByCreatedAtDesc();

    long countByType(ItemType type);

    long countByStatus(ItemStatus status);

    @Query("SELECT i FROM Item i WHERE " +
            "(:type IS NULL OR i.type = :type) AND " +
            "(:category IS NULL OR LOWER(i.category) = LOWER(:category)) AND " +
            "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:date IS NULL OR i.date = :date) AND " +
            "(:color IS NULL OR LOWER(i.color) LIKE LOWER(CONCAT('%', :color, '%'))) AND " +
            "(:brand IS NULL OR LOWER(i.brand) LIKE LOWER(CONCAT('%', :brand, '%'))) AND " +
            "(:status IS NULL OR i.status = :status) AND " +
            "(:keyword IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            " OR LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            " OR LOWER(i.location) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY i.createdAt DESC")
    List<Item> searchItems(
            @Param("type") ItemType type,
            @Param("category") String category,
            @Param("location") String location,
            @Param("date") LocalDate date,
            @Param("color") String color,
            @Param("brand") String brand,
            @Param("status") ItemStatus status,
            @Param("keyword") String keyword
    );
}