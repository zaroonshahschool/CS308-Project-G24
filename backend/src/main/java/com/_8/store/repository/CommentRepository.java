package com._8.store.repository;

import com._8.store.entity.Comment;
import com._8.store.entity.CommentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c JOIN FETCH c.user JOIN FETCH c.product WHERE c.product.id = :productId AND c.status = :status")
    List<Comment> findByProductIdAndStatus(@Param("productId") Long productId, @Param("status") CommentStatus status);

    @Query("SELECT c FROM Comment c JOIN FETCH c.user JOIN FETCH c.product WHERE c.status = :status")
    List<Comment> findByStatus(@Param("status") CommentStatus status);

    @Query("SELECT c FROM Comment c JOIN FETCH c.user JOIN FETCH c.product WHERE c.id = :id AND c.user.id = :userId")
    Optional<Comment> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}