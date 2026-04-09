package com._8.store.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvoiceSummaryResponse(
        Long orderId,
        String customerName,
        String customerEmail,
        LocalDateTime createdAt,
        String status,
        BigDecimal totalPrice
) {
}
