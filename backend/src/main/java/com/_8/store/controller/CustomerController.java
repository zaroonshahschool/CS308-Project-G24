package com._8.store.controller;

import com._8.store.dto.AddressRequest;
import com._8.store.dto.CommentRequest;
import com._8.store.dto.CommentResponse;
import com._8.store.dto.RatingRequest;
import com._8.store.dto.WishlistItemResponse;
import com._8.store.entity.User;
import com._8.store.repository.UserRepository;
import com._8.store.service.CommentService;
import com._8.store.service.RatingService;
import com._8.store.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final UserRepository userRepository;
    private final RatingService ratingService;
    private final CommentService commentService;
    private final WishlistService wishlistService;

    public CustomerController(UserRepository userRepository, RatingService ratingService,
                              CommentService commentService, WishlistService wishlistService) {
        this.userRepository = userRepository;
        this.ratingService = ratingService;
        this.commentService = commentService;
        this.wishlistService = wishlistService;
    }

    @GetMapping("/dashboard")
    public Map<String, String> dashboard() {
        return Map.of("message", "Customer access granted.");
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {

        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setStreet(request.getStreet());
        user.setCity(request.getCity());
        user.setPostalCode(request.getPostalCode());
        user.setCountry(request.getCountry());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Address updated successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "taxNumber", user.getTaxNumber(),
                "street", user.getStreet() != null ? user.getStreet() : "",
                "city", user.getCity() != null ? user.getCity() : "",
                "postalCode", user.getPostalCode() != null ? user.getPostalCode() : "",
                "country", user.getCountry() != null ? user.getCountry() : ""
        ));
    }

    @PostMapping("/products/{productId}/rate")
    public ResponseEntity<?> rateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @Valid @RequestBody RatingRequest request) {

        return ResponseEntity.ok(ratingService.rateProduct(userDetails.getUsername(), productId, request));
    }

    @PostMapping("/products/{productId}/comment")
    public ResponseEntity<?> addComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @Valid @RequestBody CommentRequest request) {

        return ResponseEntity.ok(commentService.addComment(userDetails.getUsername(), productId, request));
    }

    @GetMapping("/products/{productId}/comments")
    public ResponseEntity<List<CommentResponse>> getApprovedComments(@PathVariable Long productId) {
        return ResponseEntity.ok(commentService.getApprovedComments(productId));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request) {

        return ResponseEntity.ok(commentService.updateComment(userDetails.getUsername(), commentId, request));
    }

    @GetMapping("/products/{productId}/my-rating")
    public ResponseEntity<?> getMyRating(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {

        return ResponseEntity.ok(ratingService.getMyRating(userDetails.getUsername(), productId));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<WishlistItemResponse>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getCurrentUserWishlist());
    }

    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<List<WishlistItemResponse>> addToWishlist(@PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(productId));
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<List<WishlistItemResponse>> removeFromWishlist(@PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(productId));
    }
}
