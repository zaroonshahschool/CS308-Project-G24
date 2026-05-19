package com._8.store.controller;

import com._8.store.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
public class CommentModerationController {

    private final CommentService commentService;

    public CommentModerationController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PatchMapping("/{commentId}/approve")
    public ResponseEntity<?> approveComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.approveComment(commentId));
    }
}
