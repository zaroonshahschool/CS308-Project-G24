package com._8.store.repository;

import com._8.store.entity.Order;
import com._8.store.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findAllByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i " +
           "WHERE o.user.id = :userId AND i.product.id = :productId AND o.status IN :statuses")
    boolean existsByUserIdAndProductIdAndStatusIn(
            @Param("userId") Long userId,
            @Param("productId") Long productId,
            @Param("statuses") Collection<OrderStatus> statuses);
}
