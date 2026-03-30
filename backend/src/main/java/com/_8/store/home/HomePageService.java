package com._8.store.home;



import org.springframework.stereotype.Service;
import com._8.store.entity.Category;
import com._8.store.entity.Product;
import com._8.store.repository.CategoryRepository;
import com._8.store.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;


@Service
public class HomePageService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    private static final String[] LIBRARY_ICONS = {"⟡", "⌂", "◌", "✦", "✺", "✧"};
    private static final String[] LIBRARY_CARD_CLASSES = {
            "library-card-1", "library-card-2", "library-card-3",
            "library-card-4", "library-card-1", "library-card-2"
    };

    public HomePageService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public HomePageResponse getHomePage() {
        List<Product> allProducts = productRepository.findAllByOrderByCreatedAtDesc();
        List<Category> allCategories = categoryRepository.findAllByOrderByDisplayOrderAscNameAsc();

        Product heroProduct = productRepository.findFirstByFeaturedTrueOrderByCreatedAtDesc()
                .orElseGet(() -> allProducts.isEmpty() ? null : allProducts.get(0));

        Product editorsChoiceProduct = productRepository.findFirstByEditorChoiceTrueOrderByCreatedAtDesc()
                .orElseGet(() -> allProducts.isEmpty() ? null : allProducts.get(0));

        List<Product> notableSource = productRepository.findTop5ByNewArrivalTrueOrderByCreatedAtDesc();
        if (notableSource.isEmpty()) {
            notableSource = allProducts.stream().limit(5).toList();
        }

        List<HomePageResponse.LibraryCollection> libraries = new ArrayList<>();
        for (int i = 0; i < allCategories.size(); i++) {
            libraries.add(toLibraryCollection(allCategories.get(i), i));
        }

        List<HomePageResponse.FeaturedBook> notableBooks = notableSource.stream()
                .map(this::toFeaturedBook)
                .toList();

        return new HomePageResponse(
                toHeroSection(heroProduct),
                libraries,
                notableBooks,
                toEditorsChoice(editorsChoiceProduct),
                getValueProps()
        );
    }

    private HomePageResponse.HeroSection toHeroSection(Product product) {
        if (product == null) {
            return new HomePageResponse.HeroSection(
                    "Masterpiece Edition",
                    "Aurelia Editions",
                    "A collector-focused bookstore experience built around refined editions and curated shelves.",
                    null,
                    null,
                    "Explore Edition",
                    "/catalogue"
            );
        }

        return new HomePageResponse.HeroSection(
                "Masterpiece Edition",
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                "Explore Edition",
                "/catalogue"
        );
    }

    private HomePageResponse.LibraryCollection toLibraryCollection(Category category, int index) {
        String icon = LIBRARY_ICONS[index % LIBRARY_ICONS.length];
        String cardClass = LIBRARY_CARD_CLASSES[index % LIBRARY_CARD_CLASSES.length];

        return new HomePageResponse.LibraryCollection(
                category.getName(),
                icon,
                cardClass
        );
    }

    private HomePageResponse.FeaturedBook toFeaturedBook(Product product) {
        return new HomePageResponse.FeaturedBook(
                product.getId(),
                product.getName(),
                product.getAuthor(),
                product.getPrice(),
                product.getImageUrl(),
                product.getDescription()
        );
    }

    private HomePageResponse.EditorsChoice toEditorsChoice(Product product) {
        if (product == null) {
            return new HomePageResponse.EditorsChoice(
                    null,
                    "Curated Classics",
                    "A featured shelf built from our bookstore database.",
                    null,
                    null,
                    List.of(
                            "Editorially selected titles",
                            "Database-backed catalogue",
                            "Ready for frontend integration"
                    ),
                    "/catalogue"
            );
        }

        return new HomePageResponse.EditorsChoice(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                List.of(
                        "Category: " + product.getCategory().getName(),
                        product.getStock() > 0 ? product.getStock() + " copies in stock" : "Currently out of stock",
                        "Curated by Aurelia Editions"
                ),
                "/catalogue"
        );
    }

    private List<HomePageResponse.ValueProposition> getValueProps() {
        return List.of(
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
        );
    }
}