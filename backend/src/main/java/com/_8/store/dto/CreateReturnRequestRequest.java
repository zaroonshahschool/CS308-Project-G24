package com._8.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateReturnRequestRequest {

    @NotNull(message = "Order is required.")
    private Long orderId;

    @NotNull(message = "Product is required.")
    private Long productId;

    @NotBlank(message = "Return reason is required.")
    @Size(max = 1000, message = "Return reason must be 1000 characters or fewer.")
    private String reason;

    public Long getOrderId() {
        return orderId;
    }

    public Long getProductId() {
        return productId;
    }

    public String getReason() {
        return reason;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
