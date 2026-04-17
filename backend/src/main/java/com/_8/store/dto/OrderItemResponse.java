package com._8.store.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderItemResponse {

    private final Long productId;
    private final String productName;
    private final Integer quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal lineTotal;
    private final LocalDateTime returnedAt;

    public OrderItemResponse(Long productId, String productName, Integer quantity, BigDecimal unitPrice, BigDecimal lineTotal,
                             LocalDateTime returnedAt) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.lineTotal = lineTotal;
        this.returnedAt = returnedAt;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public LocalDateTime getReturnedAt() {
        return returnedAt;
    }
}
