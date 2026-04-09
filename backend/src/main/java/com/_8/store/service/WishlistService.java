package com._8.store.service;

import com._8.store.dto.WishlistItemResponse;
import com._8.store.entity.Product;
import com._8.store.entity.User;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getCurrentUserWishlist() {
        return getAuthenticatedUser().getWishlistProducts()
                .stream()
                .map(product -> new WishlistItemResponse(product.getId()))
                .toList();
    }

    @Transactional
    public List<WishlistItemResponse> addToWishlist(Long productId) {
        User user = getAuthenticatedUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        user.getWishlistProducts().add(product);
        userRepository.save(user);
        return toResponses(user);
    }

    @Transactional
    public List<WishlistItemResponse> removeFromWishlist(Long productId) {
        User user = getAuthenticatedUser();
        user.getWishlistProducts().removeIf(product -> product.getId().equals(productId));
        userRepository.save(user);
        return toResponses(user);
    }

    private List<WishlistItemResponse> toResponses(User user) {
        return user.getWishlistProducts().stream()
                .map(product -> new WishlistItemResponse(product.getId()))
                .toList();
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("No authenticated user found.");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user could not be found."));
    }
}
