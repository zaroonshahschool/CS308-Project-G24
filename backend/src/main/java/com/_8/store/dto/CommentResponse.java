package com._8.store.dto;

import com._8.store.entity.Comment;
import com._8.store.entity.CommentStatus;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String content;
    private CommentStatus status;
    private String customerName;
    private Long productId;
    private String productName;
    private LocalDateTime createdAt;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.status = comment.getStatus();
        this.customerName = comment.getUser().getName();
        this.productId = comment.getProduct().getId();
        this.productName = comment.getProduct().getName();
        this.createdAt = comment.getCreatedAt();
    }

    public Long getId() { return id; }
    public String getContent() { return content; }
    public CommentStatus getStatus() { return status; }
    public String getCustomerName() { return customerName; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
