package com._8.store.dto;

public record CategoryDto(
        Long id,
        String name,
        String imageUrl,
        Integer displayOrder
) {
}