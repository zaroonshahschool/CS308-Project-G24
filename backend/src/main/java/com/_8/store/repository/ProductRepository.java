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
    List<Product> findAllByOrderByPriceAscCreatedAtDesc();
    List<Product> findAllByOrderByPriceDescCreatedAtDesc();
    List<Product> findByCategory_NameIgnoreCaseOrderByPriceAscCreatedAtDesc(String categoryName);
    List<Product> findByCategory_NameIgnoreCaseOrderByPriceDescCreatedAtDesc(String categoryName);
    List<Product> findTop5ByNewArrivalTrueOrderByCreatedAtDesc();
    Optional<Product> findFirstByFeaturedTrueOrderByCreatedAtDesc();
    Optional<Product> findFirstByEditorChoiceTrueOrderByCreatedAtDesc();
    List<Product> findByLimitedEditionTrueOrderByCreatedAtDesc();
    List<Product> findByLimitedEditionTrueOrderByPriceAscCreatedAtDesc();
    List<Product> findByLimitedEditionTrueOrderByPriceDescCreatedAtDesc();
    List<Product> findByIdIn(List<Long> ids);

    @Query(value = """
            SELECT p.* FROM products p
            JOIN categories c ON c.id = p.category_id
            LEFT JOIN (
                SELECT oi.product_id, SUM(oi.quantity) AS purchase_count
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.status IN ('DELIVERED', 'PARTIALLY_RETURNED')
                  AND oi.returned_at IS NULL
                GROUP BY oi.product_id
            ) purchases ON purchases.product_id = p.id
            LEFT JOIN (
                SELECT r.product_id,
                       AVG(r.score) AS average_rating,
                       SUM(CASE WHEN r.score >= 4 THEN 1 ELSE 0 END) AS high_rating_count
                FROM ratings r
                GROUP BY r.product_id
            ) rating_stats ON rating_stats.product_id = p.id
            ORDER BY
                COALESCE(purchases.purchase_count, 0) DESC,
                COALESCE(rating_stats.average_rating, 0) DESC,
                COALESCE(rating_stats.high_rating_count, 0) DESC,
                p.created_at DESC
            """, nativeQuery = true)
    List<Product> findAllByPopularity();

    @Query(value = """
            SELECT p.* FROM products p
            JOIN categories c ON c.id = p.category_id
            LEFT JOIN (
                SELECT oi.product_id, SUM(oi.quantity) AS purchase_count
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.status IN ('DELIVERED', 'PARTIALLY_RETURNED')
                  AND oi.returned_at IS NULL
                GROUP BY oi.product_id
            ) purchases ON purchases.product_id = p.id
            LEFT JOIN (
                SELECT r.product_id,
                       AVG(r.score) AS average_rating,
                       SUM(CASE WHEN r.score >= 4 THEN 1 ELSE 0 END) AS high_rating_count
                FROM ratings r
                GROUP BY r.product_id
            ) rating_stats ON rating_stats.product_id = p.id
            WHERE LOWER(c.name) = LOWER(:category)
            ORDER BY
                COALESCE(purchases.purchase_count, 0) DESC,
                COALESCE(rating_stats.average_rating, 0) DESC,
                COALESCE(rating_stats.high_rating_count, 0) DESC,
                p.created_at DESC
            """, nativeQuery = true)
    List<Product> findByCategoryPopularity(@Param("category") String category);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
