package com._8.store.dto;

import java.math.BigDecimal;
import java.util.List;

public record ApplyDiscountRequest(
        BigDecimal discountRate,
        List<Long> productIds
) {
}
