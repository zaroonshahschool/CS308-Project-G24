package com._8.store.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductDto(
        Long id,
        String name,
        String author,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        BigDecimal discountRate,
        BigDecimal costPrice,
        Integer stock,
        String imageUrl,
        String category,
        String model,
        String serialNumber,
        String warrantyStatus,
        String distributor,
        boolean featured,
        boolean editorChoice,
        boolean newArrival,
        LocalDateTime createdAt
) {
}
