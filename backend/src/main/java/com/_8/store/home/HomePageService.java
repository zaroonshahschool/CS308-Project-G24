package com._8.store.home;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class HomePageService {

    public HomePageResponse getHomePage() {
        return new HomePageResponse(
                new HomePageResponse.HeroSection(
                        "Masterpiece Edition",
                        "The Secret History",
                        "A collector's edition curated for readers who want literary fiction, tactile design, and a display-worthy spine.",
                        new BigDecimal("39.99"),
                        "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=900&auto=format&fit=crop",
                        "Explore Edition",
                        "/catalogue"
                ),
                List.of(
                        new HomePageResponse.LibraryCollection("Science Fiction & Fantasy", "⟡", "library-card-1"),
                        new HomePageResponse.LibraryCollection("History & Antiquity", "⌂", "library-card-2"),
                        new HomePageResponse.LibraryCollection("Classic Fiction", "◌", "library-card-3"),
                        new HomePageResponse.LibraryCollection("Mystery & Crime", "✦", "library-card-4")
                ),
                List.of(
                        new HomePageResponse.FeaturedBook(
                                1L,
                                "The Midnight Library",
                                "Matt Haig",
                                new BigDecimal("24.99"),
                                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
                                "A reflective modern novel about regret, possibility, and second chances."
                        ),
                        new HomePageResponse.FeaturedBook(
                                2L,
                                "Dune",
                                "Frank Herbert",
                                new BigDecimal("29.99"),
                                "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop",
                                "Epic political science fiction with a world dense enough to reward rereading."
                        ),
                        new HomePageResponse.FeaturedBook(
                                3L,
                                "Sapiens",
                                "Yuval Noah Harari",
                                new BigDecimal("27.99"),
                                "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop",
                                "A brisk big-picture history of humankind across culture, biology, and systems."
                        ),
                        new HomePageResponse.FeaturedBook(
                                4L,
                                "The Name of the Rose",
                                "Umberto Eco",
                                new BigDecimal("32.99"),
                                "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=400&auto=format&fit=crop",
                                "A literary mystery balancing theology, politics, and murder investigation."
                        ),
                        new HomePageResponse.FeaturedBook(
                                5L,
                                "SPQR: A History of Ancient Rome",
                                "Mary Beard",
                                new BigDecimal("34.99"),
                                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop",
                                "A modern history of Rome that stays readable without flattening complexity."
                        )
                ),
                new HomePageResponse.EditorsChoice(
                        6L,
                        "One Hundred Years of Solitude",
                        "A flagship edition for readers building a shelf of essential modern classics.",
                        new BigDecimal("18.99"),
                        "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?q=80&w=400&auto=format&fit=crop",
                        List.of(
                                "Archival-inspired cover treatment",
                                "Acid-free premium paper stock",
                                "Notes on translation and publication context"
                        ),
                        "/catalogue"
                ),
                List.of(
                        new HomePageResponse.ValueProposition(
                                "Exquisite Packaging",
                                "Every order is carefully wrapped in bespoke protective packaging.",
                                "package"
                        ),
                        new HomePageResponse.ValueProposition(
                                "Worldwide Delivery",
                                "Secure, trackable shipping to bibliophiles across the globe.",
                                "globe"
                        ),
                        new HomePageResponse.ValueProposition(
                                "The Aurelia Guarantee",
                                "Uncompromising quality in typography, illustration, and binding.",
                                "shield"
                        )
                )
        );
    }
}
