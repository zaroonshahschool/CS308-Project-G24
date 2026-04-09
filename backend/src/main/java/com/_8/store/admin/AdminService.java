package com._8.store.admin;

import com._8.store.dto.CategoryDto;
import com._8.store.dto.ProductDto;
import com._8.store.entity.Category;
import com._8.store.entity.Product;
import com._8.store.repository.CategoryRepository;
import com._8.store.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public AdminService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public ProductDto createProduct(ProductUpsertRequest request) {
        Product product = new Product();
        applyRequest(product, request, true);
        return toProductDto(productRepository.save(product));
    }

    public ProductDto updateProduct(Long id, ProductUpsertRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));

        applyRequest(product, request, false);
        return toProductDto(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found.");
        }
        productRepository.deleteById(id);
    }

    public CategoryDto createCategory(CategoryCreateRequest request) {
        String categoryName = requireText(request.getName(), "Category name is required.");

        if (categoryRepository.findByNameIgnoreCase(categoryName).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category already exists.");
        }

        Integer displayOrder = request.getDisplayOrder() != null ? request.getDisplayOrder() : 999;

        Category category = new Category(
                categoryName,
                blankToNull(request.getImageUrl()),
                displayOrder
        );

        Category saved = categoryRepository.save(category);
        return new CategoryDto(saved.getId(), saved.getName(), saved.getImageUrl(), saved.getDisplayOrder());
    }

    private void applyRequest(Product product, ProductUpsertRequest request, boolean isCreate) {
        String categoryName = requireText(request.getCategoryName(), "Category is required.");
        Category category = categoryRepository.findByNameIgnoreCase(categoryName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected category does not exist."));

        product.setName(requireText(request.getName(), "Product name is required."));
        product.setAuthor(requireText(request.getAuthor(), "Author is required."));
        product.setDescription(requireText(request.getDescription(), "Description is required."));

        if (request.getPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price is required.");
        }
        if (request.getCostPrice() != null && request.getCostPrice().signum() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cost price must be zero or greater.");
        }
        if (request.getStock() == null || request.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock must be zero or greater.");
        }

        product.setPrice(request.getPrice());
        product.setOriginalPrice(product.getOriginalPrice() != null ? product.getOriginalPrice() : request.getPrice());
        product.setCostPrice(request.getCostPrice() != null ? request.getCostPrice() : request.getPrice());
        product.setDiscountRate(product.getDiscountRate() != null ? product.getDiscountRate() : java.math.BigDecimal.ZERO);
        product.setStock(request.getStock());
        product.setImageUrl(blankToNull(request.getImageUrl()));
        product.setModel(blankToNull(request.getModel()));
        product.setSerialNumber(blankToNull(request.getSerialNumber()));
        product.setWarrantyStatus(blankToNull(request.getWarrantyStatus()));
        product.setDistributor(blankToNull(request.getDistributor()));
        product.setCategory(category);
        product.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        product.setEditorChoice(Boolean.TRUE.equals(request.getEditorChoice()));
        product.setNewArrival(Boolean.TRUE.equals(request.getNewArrival()));

        if (isCreate || product.getCreatedAt() == null) {
            product.setCreatedAt(LocalDateTime.now());
        }
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
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
                product.getModel(),
                product.getSerialNumber(),
                product.getWarrantyStatus(),
                product.getDistributor(),
                product.isFeatured(),
                product.isEditorChoice(),
                product.isNewArrival(),
                product.getCreatedAt()
        );
    }
}
