package com._8.store.catalog;

import com._8.store.dto.CategoryDto;
import com._8.store.dto.ProductDto;
import com._8.store.entity.Category;
import com._8.store.entity.Product;
import com._8.store.repository.CategoryRepository;
import com._8.store.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public CatalogService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDto> getAllProducts(String category) {
        List<Product> products;

        if (category == null || category.isBlank() || category.equalsIgnoreCase("All")) {
            products = productRepository.findAllByOrderByCreatedAtDesc();
        } else {
            products = productRepository.findByCategory_NameIgnoreCaseOrderByCreatedAtDesc(category);
        }

        return products.stream()
                .map(this::toProductDto)
                .toList();
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
                product.getCreatedAt()
        );
    }

    private CategoryDto toCategoryDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getImageUrl(),
                category.getDisplayOrder()
        );
    }
}
