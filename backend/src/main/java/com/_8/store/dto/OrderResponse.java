package com._8.store.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private final Long orderId;
    private final String userName;
    private final String userEmail;
    private final LocalDateTime createdAt;
    private final BigDecimal totalPrice;
    private final List<OrderItemResponse> items;

    public OrderResponse(
            Long orderId,
            String userName,
            String userEmail,
            LocalDateTime createdAt,
            BigDecimal totalPrice,
            List<OrderItemResponse> items
    ) {
        this.orderId = orderId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.createdAt = createdAt;
        this.totalPrice = totalPrice;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
