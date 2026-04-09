package com._8.store.controller;

import com._8.store.dto.CommentResponse;
import com._8.store.dto.OrderResponse;
import com._8.store.service.CommentService;
import com._8.store.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-manager")
public class SalesManagerController {

    private final CommentService commentService;
    private final OrderService orderService;

    public SalesManagerController(CommentService commentService, OrderService orderService) {
        this.commentService = commentService;
        this.orderService = orderService;
    }

    @GetMapping("/sales")
    public Map<String, String> sales() {
        return Map.of("message", "Sales manager placeholder endpoint.");
    }

    @GetMapping("/comments/pending")
    public ResponseEntity<List<CommentResponse>> getPendingComments() {
        return ResponseEntity.ok(commentService.getPendingComments());
    }

    @PutMapping("/comments/{commentId}/approve")
    public ResponseEntity<?> approveComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.approveComment(commentId));
    }

    @PutMapping("/comments/{commentId}/reject")
    public ResponseEntity<?> rejectComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.rejectComment(commentId));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{orderId}/advance-status")
    public ResponseEntity<OrderResponse> advanceOrderStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.advanceOrderStatus(orderId));
    }
}
