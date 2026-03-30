package com._8.store.repository;

import com._8.store.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByOrderByCreatedAtDesc();
    List<Product> findByCategory_NameIgnoreCaseOrderByCreatedAtDesc(String categoryName);
    List<Product> findTop5ByNewArrivalTrueOrderByCreatedAtDesc();
    Optional<Product> findFirstByFeaturedTrueOrderByCreatedAtDesc();
    Optional<Product> findFirstByEditorChoiceTrueOrderByCreatedAtDesc();
}