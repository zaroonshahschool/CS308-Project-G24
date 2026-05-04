package com._8.store.repository;

import com._8.store.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("""
            SELECT item FROM CartItem item
            JOIN FETCH item.product product
            JOIN FETCH product.category
            WHERE item.user.id = :userId
            ORDER BY item.updatedAt DESC
            """)
    List<CartItem> findAllByUserIdWithProducts(@Param("userId") Long userId);

    long deleteByUser_Id(Long userId);
}
