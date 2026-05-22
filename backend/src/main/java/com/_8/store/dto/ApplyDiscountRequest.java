package com._8.store.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ApplyDiscountRequest(
        @NotNull(message = "Discount rate is required")
        @DecimalMin(value = "0.01", message = "Discount rate must be greater than 0")
        @DecimalMax(value = "99.99", message = "Discount rate must be less than 100")
        BigDecimal discountRate,
        @NotEmpty(message = "At least one product must be selected")
        List<@NotNull(message = "Product id is required") Long> productIds
) {
}
