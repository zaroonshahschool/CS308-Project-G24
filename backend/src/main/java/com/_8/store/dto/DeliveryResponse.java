package com._8.store.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DeliveryResponse {

    private final Long deliveryId;
    private final Long orderId;
    private final Long customerId;
    private final String customerName;
    private final Long productId;
    private final String productName;
    private final Integer quantity;
    private final BigDecimal totalPrice;
    private final String deliveryAddress;
    private final String orderStatus;
    private final boolean completed;
    private final LocalDateTime createdAt;

    public DeliveryResponse(
            Long deliveryId,
            Long orderId,
            Long customerId,
            String customerName,
            Long productId,
            String productName,
            Integer quantity,
            BigDecimal totalPrice,
            String deliveryAddress,
            String orderStatus,
            boolean completed,
            LocalDateTime createdAt
    ) {
        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.deliveryAddress = deliveryAddress;
        this.orderStatus = orderStatus;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public Long getDeliveryId() { return deliveryId; }
    public Long getOrderId() { return orderId; }
    public Long getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public String getOrderStatus() { return orderStatus; }
    public boolean isCompleted() { return completed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
