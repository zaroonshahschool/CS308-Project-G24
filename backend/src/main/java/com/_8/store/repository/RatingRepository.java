package com._8.store.repository;

import com._8.store.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Optional<Rating> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.product.id = :productId")
    Double findAverageScoreByProductId(@Param("productId") Long productId);
}
