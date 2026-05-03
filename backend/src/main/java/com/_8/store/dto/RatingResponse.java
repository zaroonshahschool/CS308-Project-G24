package com._8.store.dto;

import com._8.store.entity.Rating;

import java.time.LocalDateTime;

public class RatingResponse {

    private Long id;
    private Integer score;
    private String customerName;
    private String userEmail;
    private Long productId;
    private String productName;
    private LocalDateTime createdAt;

    public RatingResponse(Rating rating) {
        this.id = rating.getId();
        this.score = rating.getScore();
        this.customerName = rating.getUser().getName();
        this.userEmail = rating.getUser().getEmail();
        this.productId = rating.getProduct().getId();
        this.productName = rating.getProduct().getName();
        this.createdAt = rating.getCreatedAt();
    }

    public Long getId() { return id; }
    public Integer getScore() { return score; }
    public String getCustomerName() { return customerName; }
    public String getUserEmail() { return userEmail; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
