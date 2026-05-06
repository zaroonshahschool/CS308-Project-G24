package com._8.store.catalog;

import com._8.store.dto.CategoryDto;
import com._8.store.dto.ProductDto;
import com._8.store.entity.Category;
import com._8.store.entity.Product;
import com._8.store.repository.CategoryRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.RatingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RatingRepository ratingRepository;

    public CatalogService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          RatingRepository ratingRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.ratingRepository = ratingRepository;
    }

    public List<ProductDto> getAllProducts(String category, String sort) {
        String normalizedCategory = normalizeCategory(category);
        List<Product> products = switch (normalizeSort(sort)) {
            case "price-asc" -> normalizedCategory == null
                    ? productRepository.findAllByOrderByPriceAscCreatedAtDesc()
                    : productRepository.findByCategory_NameIgnoreCaseOrderByPriceAscCreatedAtDesc(normalizedCategory);
            case "price-desc" -> normalizedCategory == null
                    ? productRepository.findAllByOrderByPriceDescCreatedAtDesc()
                    : productRepository.findByCategory_NameIgnoreCaseOrderByPriceDescCreatedAtDesc(normalizedCategory);
            case "popularity" -> normalizedCategory == null
                    ? productRepository.findAllByPopularity()
                    : productRepository.findByCategoryPopularity(normalizedCategory);
            default -> normalizedCategory == null
                    ? productRepository.findAllByOrderByCreatedAtDesc()
                    : productRepository.findByCategory_NameIgnoreCaseOrderByCreatedAtDesc(normalizedCategory);
        };

        return products.stream()
                .map(this::toProductDto)
                .toList();
    }

    public List<ProductDto> getAllProducts(String category) {
        return getAllProducts(category, null);
    }

    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::toProductDto)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(this::toCategoryDto)
                .toList();
    }

    private ProductDto toProductDto(Product product) {
        Double average = ratingRepository.findAverageScoreByProductId(product.getId());
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getAuthor(),
                product.getDescription(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getDiscountRate(),
                product.getCostPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getCategory().getName(),
                product.getPublisher(),
                product.getPaperType(),
                product.getPageCount(),
                product.getDimensions(),
                product.getPublicationDate(),
                product.getIsbn(),
                product.getLanguage(),
                product.getCoverType(),
                product.isFeatured(),
                product.isEditorChoice(),
                product.isNewArrival(),
                product.isLimitedEdition(),
                average != null ? average : 0.0,
                product.getCreatedAt()
        );
    }

    public List<ProductDto> getLimitedEditionProducts(String sort) {
        List<Product> products = switch (normalizeSort(sort)) {
            case "price-asc" -> productRepository.findByLimitedEditionTrueOrderByPriceAscCreatedAtDesc();
            case "price-desc" -> productRepository.findByLimitedEditionTrueOrderByPriceDescCreatedAtDesc();
            default -> productRepository.findByLimitedEditionTrueOrderByCreatedAtDesc();
        };
        return products.stream().map(this::toProductDto).toList();
    }

    private CategoryDto toCategoryDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getImageUrl(),
                category.getDisplayOrder()
        );
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank() || category.equalsIgnoreCase("All")) {
            return null;
        }

        return category.trim();
    }

    private String normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "relevance";
        }

        return sort.trim().toLowerCase();
    }
}
