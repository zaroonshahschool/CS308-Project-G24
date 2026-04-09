package com._8.store.home;

import java.math.BigDecimal;
import java.util.List;

public record HomePageResponse(
        HeroSection hero,
        List<LibraryCollection> libraries,
        List<FeaturedBook> notableBooks,
        EditorsChoice editorsChoice,
        List<ValueProposition> valueProps
) {

    public record HeroSection(
            String badge,
            String title,
            String description,
            BigDecimal price,
            String coverImage,
            String ctaLabel,
            String ctaHref
    ) {
    }

    public record LibraryCollection(
            String name,
            String icon,
            String cardClass,
            String href
    ) {
    }

    public record FeaturedBook(
            Long id,
            String title,
            String author,
            BigDecimal price,
            String coverImage,
            String description
    ) {
    }

    public record EditorsChoice(
            Long id,
            String title,
            String description,
            BigDecimal price,
            String coverImage,
            List<String> features,
            String detailsHref
    ) {
    }

    public record ValueProposition(
            String title,
            String description,
            String icon
    ) {
    }
}
