package com._8.store.dto;

import java.util.List;

public record CollectionDetailDto(
        Long id,
        String name,
        String description,
        String imageUrl,
        List<ProductDto> products
) {}
