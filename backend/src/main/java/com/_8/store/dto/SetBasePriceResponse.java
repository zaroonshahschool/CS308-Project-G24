package com._8.store.dto;

import java.math.BigDecimal;

public record SetBasePriceResponse(
        Long productId,
        String productName,
        BigDecimal basePrice,
        BigDecimal sellingPrice,
        BigDecimal discountRate
) {
}
