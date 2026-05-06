package com._8.store.dto;

public record CollectionSummaryDto(
        Long id,
        String name,
        String description,
        String imageUrl,
        int productCount
) {}
