package com._8.store.dto;

import com._8.store.entity.Comment;
import com._8.store.entity.CommentStatus;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String content;
    private CommentStatus status;
    private String customerName;
    private String userEmail;
    private Long productId;
    private String productName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean edited;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.status = comment.getStatus();
        this.customerName = comment.getUser().getName();
        this.userEmail = comment.getUser().getEmail();
        this.productId = comment.getProduct().getId();
        this.productName = comment.getProduct().getName();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        this.edited = comment.getUpdatedAt() != null;
    }

    public Long getId() { return id; }
    public String getContent() { return content; }
    public CommentStatus getStatus() { return status; }
    public String getCustomerName() { return customerName; }
    public String getUserEmail() { return userEmail; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public boolean isEdited() { return edited; }
}
