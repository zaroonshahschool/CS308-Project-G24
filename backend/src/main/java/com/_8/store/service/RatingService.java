package com._8.store.service;

import com._8.store.dto.RatingRequest;
import com._8.store.entity.OrderStatus;
import com._8.store.entity.Product;
import com._8.store.entity.Rating;
import com._8.store.entity.User;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.RatingRepository;
import com._8.store.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public RatingService(RatingRepository ratingRepository, UserRepository userRepository,
                         ProductRepository productRepository, OrderRepository orderRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public Map<String, Object> rateProduct(String email, Long productId, RatingRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        if (!orderRepository.existsByUserIdAndProductIdAndStatusIn(
                user.getId(), productId,
                List.of(OrderStatus.DELIVERED, OrderStatus.PARTIALLY_RETURNED))) {
            throw new IllegalArgumentException("You can only rate products from delivered orders.");
        }

        Rating rating;
        if (ratingRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            rating = ratingRepository.findByUserIdAndProductId(user.getId(), productId).get();
            rating.setScore(request.getScore());
        } else {
            rating = new Rating(user, product, request.getScore(), LocalDateTime.now());
        }

        ratingRepository.save(rating);

        Double average = ratingRepository.findAverageScoreByProductId(productId);
        return Map.of(
                "message", "Rating saved successfully.",
                "averageRating", average != null ? average : 0.0
        );
    }

    public Map<String, Object> getAverageRating(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        Double average = ratingRepository.findAverageScoreByProductId(productId);
        return Map.of("productId", productId, "averageRating", average != null ? average : 0.0);
    }

    public Map<String, Object> getMyRating(String email, Long productId) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return ratingRepository.findByUserIdAndProductId(user.getId(), productId)
                .<Map<String, Object>>map(r -> Map.of("score", r.getScore()))
                .orElseGet(() -> {
                    Map<String, Object> empty = new java.util.HashMap<>();
                    empty.put("score", null);
                    return empty;
                });
    }
}
