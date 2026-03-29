package com._8.store.dto;

import java.math.BigDecimal;

public record ProductDto(
        Long id,
        String name,
        String author,
        String description,
        BigDecimal price,
        Integer stock,
        String imageUrl,
        String category
) {
}