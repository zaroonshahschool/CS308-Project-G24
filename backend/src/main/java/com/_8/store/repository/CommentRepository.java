package com._8.store.repository;

import com._8.store.entity.Comment;
import com._8.store.entity.CommentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByProductIdAndStatus(Long productId, CommentStatus status);

    List<Comment> findByStatus(CommentStatus status);
}