package com._8.store.repository;

import com._8.store.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByOrderByCreatedAtDesc();
    List<Product> findByCategory_NameIgnoreCaseOrderByCreatedAtDesc(String categoryName);
    List<Product> findTop5ByNewArrivalTrueOrderByCreatedAtDesc();
    Optional<Product> findFirstByFeaturedTrueOrderByCreatedAtDesc();
    Optional<Product> findFirstByEditorChoiceTrueOrderByCreatedAtDesc();
    List<Product> findByIdIn(List<Long> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
