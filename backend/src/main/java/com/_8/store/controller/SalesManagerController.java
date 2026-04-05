package com._8.store.controller;

import com._8.store.dto.CommentResponse;
import com._8.store.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-manager")
public class SalesManagerController {

    private final CommentService commentService;

    public SalesManagerController(CommentService commentService) {
        this.commentService = commentService;
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
}
