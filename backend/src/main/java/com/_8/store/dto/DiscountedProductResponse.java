package com._8.store.dto;

import java.math.BigDecimal;

public record DiscountedProductResponse(
        Long productId,
        String productName,
        BigDecimal previousPrice,
        BigDecimal newPrice,
        BigDecimal discountRate,
        int notifiedUsers
) {
}
