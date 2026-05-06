package com._8.store.service;

import com._8.store.dto.CommentRequest;
import com._8.store.dto.CommentResponse;
import com._8.store.entity.*;
import com._8.store.repository.CommentHistoryRepository;
import com._8.store.repository.CommentRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.List.of;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentHistoryRepository commentHistoryRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public CommentService(CommentRepository commentRepository, CommentHistoryRepository commentHistoryRepository,
                          UserRepository userRepository, ProductRepository productRepository,
                          OrderRepository orderRepository) {
        this.commentRepository = commentRepository;
        this.commentHistoryRepository = commentHistoryRepository;
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

        if (commentRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            throw new IllegalArgumentException("You have already submitted a comment for this product.");
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

        commentHistoryRepository.save(new CommentHistory(comment, comment.getContent(), LocalDateTime.now()));

        comment.setContent(request.getContent());
        comment.setStatus(CommentStatus.PENDING);
        comment.setUpdatedAt(LocalDateTime.now());
        commentRepository.save(comment);

        return Map.of("message", "Comment updated and awaiting approval.");
    }

    public Optional<CommentResponse> getMyComment(String email, Long productId) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return commentRepository.findByUserIdAndProductId(user.getId(), productId)
                .map(CommentResponse::new);
    }

    public List<CommentResponse> getApprovedComments(Long productId) {
        return commentRepository.findByProductIdAndStatus(productId, CommentStatus.APPROVED)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    public List<CommentResponse> getAllComments() {
        return commentRepository.findAllWithDetails()
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
