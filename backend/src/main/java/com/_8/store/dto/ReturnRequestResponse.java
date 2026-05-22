package com._8.store.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReturnRequestResponse {

    private final Long id;
    private final Long orderId;
    private final Long customerId;
    private final String customerName;
    private final Long productId;
    private final String productName;
    private final LocalDateTime orderDate;
    private final String status;
    private final String reason;
    private final String rejectionReason;
    private final LocalDateTime requestedAt;
    private final LocalDateTime resolvedAt;
    private final BigDecimal refundAmount;

    public ReturnRequestResponse(
            Long id,
            Long orderId,
            Long customerId,
            String customerName,
            Long productId,
            String productName,
            LocalDateTime orderDate,
            String status,
            String reason,
            String rejectionReason,
            LocalDateTime requestedAt,
            LocalDateTime resolvedAt,
            BigDecimal refundAmount
    ) {
        this.id = id;
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.productId = productId;
        this.productName = productName;
        this.orderDate = orderDate;
        this.status = status;
        this.reason = reason;
        this.rejectionReason = rejectionReason;
        this.requestedAt = requestedAt;
        this.resolvedAt = resolvedAt;
        this.refundAmount = refundAmount;
    }

    public Long getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public String getStatus() {
        return status;
    }

    public String getReason() {
        return reason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
}
