package com._8.store.controller;

import com._8.store.dto.CommentResponse;
import com._8.store.dto.InvoiceSummaryResponse;
import com._8.store.dto.RatingResponse;
import com._8.store.repository.RatingRepository;
import com._8.store.service.CommentService;
import com._8.store.service.SalesManagerService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-manager")
public class ProductManagerController {

    private final CommentService commentService;
    private final SalesManagerService salesManagerService;
    private final RatingRepository ratingRepository;

    public ProductManagerController(
            CommentService commentService,
            SalesManagerService salesManagerService,
            RatingRepository ratingRepository
    ) {
        this.commentService = commentService;
        this.salesManagerService = salesManagerService;
        this.ratingRepository = ratingRepository;
    }

    @GetMapping("/products")
    public Map<String, String> products() {
        return Map.of("message", "Product manager placeholder endpoint.");
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceSummaryResponse>> getAllInvoices() {
        return ResponseEntity.ok(salesManagerService.getAllInvoices());
    }

    @GetMapping("/comments")
    public ResponseEntity<List<CommentResponse>> getAllComments() {
        return ResponseEntity.ok(commentService.getAllComments());
    }

    @GetMapping("/comments/pending")
    public ResponseEntity<List<CommentResponse>> getPendingComments() {
        return ResponseEntity.ok(commentService.getPendingComments());
    }

    @GetMapping("/ratings")
    public ResponseEntity<List<RatingResponse>> getAllRatings() {
        List<RatingResponse> ratings = ratingRepository.findAllWithDetails()
                .stream()
                .map(RatingResponse::new)
                .toList();
        return ResponseEntity.ok(ratings);
    }

    @DeleteMapping("/ratings/{ratingId}")
    public ResponseEntity<?> deleteRating(@PathVariable Long ratingId) {
        if (!ratingRepository.existsById(ratingId)) {
            throw new IllegalArgumentException("Rating not found.");
        }
        ratingRepository.deleteById(ratingId);
        return ResponseEntity.ok(Map.of("message", "Rating deleted."));
    }

    @PutMapping("/comments/{commentId}/approve")
    public ResponseEntity<?> approveComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.approveComment(commentId));
    }

    @PutMapping("/comments/{commentId}/reject")
    public ResponseEntity<?> rejectComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.rejectComment(commentId));
    }
}
