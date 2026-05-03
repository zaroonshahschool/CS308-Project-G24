package com._8.store.service;

import com._8.store.dto.CommentRequest;
import com._8.store.dto.CommentResponse;
import com._8.store.entity.*;
import com._8.store.repository.CommentRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static java.util.List.of;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository,
                          ProductRepository productRepository, OrderRepository orderRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public Map<String, String> addComment(String email, Long productId, CommentRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        if (!orderRepository.existsByUserIdAndProductIdAndStatusIn(
                user.getId(), productId,
                of(OrderStatus.DELIVERED, OrderStatus.PARTIALLY_RETURNED))) {
            throw new IllegalArgumentException("You can only comment on products from delivered orders.");
        }

        Comment comment = new Comment(user, product, request.getContent(), CommentStatus.PENDING, LocalDateTime.now());
        commentRepository.save(comment);

        return Map.of("message", "Comment submitted and awaiting approval.");
    }

    @Transactional
    public Map<String, String> updateComment(String email, Long commentId, CommentRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Comment comment = commentRepository.findByIdAndUserId(commentId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Comment not found or does not belong to you."));

        comment.setContent(request.getContent());
        comment.setStatus(CommentStatus.PENDING);
        commentRepository.save(comment);

        return Map.of("message", "Comment updated and awaiting approval.");
    }

    public List<CommentResponse> getApprovedComments(Long productId) {
        return commentRepository.findByProductIdAndStatus(productId, CommentStatus.APPROVED)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    public List<CommentResponse> getPendingComments() {
        return commentRepository.findByStatus(CommentStatus.PENDING)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    public Map<String, String> approveComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found."));
        comment.setStatus(CommentStatus.APPROVED);
        commentRepository.save(comment);
        return Map.of("message", "Comment approved.");
    }

    public Map<String, String> rejectComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found."));
        comment.setStatus(CommentStatus.REJECTED);
        commentRepository.save(comment);
        return Map.of("message", "Comment rejected.");
    }
}
