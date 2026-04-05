package com._8.store.service;

import com._8.store.dto.RatingRequest;
import com._8.store.entity.*;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.RatingRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private RatingService ratingService;

    private User mockUser;
    private Product mockProduct;

    @BeforeEach
    void setUp() {
        mockUser = new User("John", "john@example.com", "pass", Role.CUSTOMER, "1234567890");
        mockUser.setId(1L);

        mockProduct = new Product();
        mockProduct.setId(10L);
        mockProduct.setName("Test Book");
        mockProduct.setPrice(BigDecimal.valueOf(29.99));
        mockProduct.setStock(5);
        mockProduct.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void rateProduct_validRequest_returnsAverageRating() {
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(productRepository.findById(10L)).willReturn(Optional.of(mockProduct));
        given(orderRepository.existsByUserIdAndProductId(1L, 10L)).willReturn(true);
        given(ratingRepository.existsByUserIdAndProductId(1L, 10L)).willReturn(false);
        given(ratingRepository.save(any())).willReturn(new Rating());
        given(ratingRepository.findAverageScoreByProductId(10L)).willReturn(4.5);

        RatingRequest request = new RatingRequest();
        request.setScore(5);

        Map<String, Object> result = ratingService.rateProduct("john@example.com", 10L, request);

        assertThat(result.get("message")).isEqualTo("Rating saved successfully.");
        assertThat(result.get("averageRating")).isEqualTo(4.5);
    }

    @Test
    void rateProduct_userNotPurchased_throwsException() {
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(productRepository.findById(10L)).willReturn(Optional.of(mockProduct));
        given(orderRepository.existsByUserIdAndProductId(1L, 10L)).willReturn(false);

        RatingRequest request = new RatingRequest();
        request.setScore(4);

        assertThatThrownBy(() -> ratingService.rateProduct("john@example.com", 10L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("You can only rate products you have purchased.");
    }

    @Test
    void rateProduct_productNotFound_throwsException() {
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(productRepository.findById(99L)).willReturn(Optional.empty());

        RatingRequest request = new RatingRequest();
        request.setScore(3);

        assertThatThrownBy(() -> ratingService.rateProduct("john@example.com", 99L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Product not found.");
    }

    @Test
    void rateProduct_existingRating_updatesScore() {
        Rating existingRating = new Rating(mockUser, mockProduct, 3, LocalDateTime.now());

        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(productRepository.findById(10L)).willReturn(Optional.of(mockProduct));
        given(orderRepository.existsByUserIdAndProductId(1L, 10L)).willReturn(true);
        given(ratingRepository.existsByUserIdAndProductId(1L, 10L)).willReturn(true);
        given(ratingRepository.findByUserIdAndProductId(1L, 10L)).willReturn(Optional.of(existingRating));
        given(ratingRepository.save(any())).willReturn(existingRating);
        given(ratingRepository.findAverageScoreByProductId(10L)).willReturn(5.0);

        RatingRequest request = new RatingRequest();
        request.setScore(5);

        Map<String, Object> result = ratingService.rateProduct("john@example.com", 10L, request);

        assertThat(existingRating.getScore()).isEqualTo(5);
        assertThat(result.get("averageRating")).isEqualTo(5.0);
    }
}
