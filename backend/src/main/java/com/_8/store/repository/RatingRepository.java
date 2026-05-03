package com._8.store.repository;

import com._8.store.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Optional<Rating> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.product.id = :productId")
    Double findAverageScoreByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM Rating r JOIN FETCH r.user JOIN FETCH r.product ORDER BY r.createdAt DESC")
    List<Rating> findAllWithDetails();
}
