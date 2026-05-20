package com._8.store.admin;

import com._8.store.dto.CategoryDto;
import com._8.store.dto.CollectionSummaryDto;
import com._8.store.dto.DeliveryResponse;
import com._8.store.dto.ProductDto;
import com._8.store.entity.Category;
import com._8.store.entity.Collection;
import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com._8.store.entity.OrderStatus;
import com._8.store.entity.Product;
import com._8.store.repository.CategoryRepository;
import com._8.store.repository.CollectionRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.RatingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final RatingRepository ratingRepository;
    private final CollectionRepository collectionRepository;

    public AdminService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            OrderRepository orderRepository,
            RatingRepository ratingRepository,
            CollectionRepository collectionRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.ratingRepository = ratingRepository;
        this.collectionRepository = collectionRepository;
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getAllDeliveries() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        List<DeliveryResponse> deliveries = new ArrayList<>();

        for (Order order : orders) {
            OrderStatus status = order.getStatus() != null ? order.getStatus() : OrderStatus.PROCESSING;
            if (status == OrderStatus.CANCELLED || status == OrderStatus.RETURNED) {
                continue;
            }

            String address = formatAddress(order);

            for (OrderItem item : order.getItems()) {
                boolean itemReturned = item.getReturnedAt() != null;
                boolean completed = status == OrderStatus.DELIVERED && !itemReturned;

                deliveries.add(new DeliveryResponse(
                        item.getId(),
                        order.getId(),
                        order.getUser().getId(),
                        order.getUser().getName(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getLineTotal(),
                        address,
                        status.name(),
                        completed,
                        order.getCreatedAt()
                ));
            }
        }

        return deliveries;
    }

    private String formatAddress(Order order) {
        List<String> parts = new ArrayList<>();
        if (order.getShippingStreet() != null && !order.getShippingStreet().isBlank()) parts.add(order.getShippingStreet());
        if (order.getShippingCity() != null && !order.getShippingCity().isBlank()) parts.add(order.getShippingCity());
        if (order.getShippingPostalCode() != null && !order.getShippingPostalCode().isBlank()) parts.add(order.getShippingPostalCode());
        if (order.getShippingCountry() != null && !order.getShippingCountry().isBlank()) parts.add(order.getShippingCountry());
        return String.join(", ", parts);
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
        product.setPublisher(blankToNull(request.getPublisher()));
        product.setPaperType(blankToNull(request.getPaperType()));
        product.setPageCount(request.getPageCount());
        product.setDimensions(blankToNull(request.getDimensions()));
        product.setPublicationDate(blankToNull(request.getPublicationDate()));
        product.setIsbn(blankToNull(request.getIsbn()));
        product.setLanguage(blankToNull(request.getLanguage()));
        product.setCoverType(blankToNull(request.getCoverType()));
        product.setCategory(category);
        product.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        product.setEditorChoice(Boolean.TRUE.equals(request.getEditorChoice()));
        product.setNewArrival(Boolean.TRUE.equals(request.getNewArrival()));
        product.setLimitedEdition(Boolean.TRUE.equals(request.getLimitedEdition()));

        if (isCreate || product.getCreatedAt() == null) {
            product.setCreatedAt(LocalDateTime.now());
        }
    }

    @Transactional(readOnly = true)
    public List<CollectionSummaryDto> getAllCollections() {
        return collectionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(c -> new CollectionSummaryDto(c.getId(), c.getName(), c.getDescription(), c.getImageUrl(), c.getProducts().size()))
                .toList();
    }

    @Transactional
    public CollectionSummaryDto createCollection(CollectionUpsertRequest request) {
        String name = requireText(request.getName(), "Collection name is required.");
        Collection collection = new Collection(name, blankToNull(request.getDescription()), blankToNull(request.getImageUrl()), LocalDateTime.now());
        assignProducts(collection, request.getProductIds());
        Collection saved = collectionRepository.save(collection);
        return new CollectionSummaryDto(saved.getId(), saved.getName(), saved.getDescription(), saved.getImageUrl(), saved.getProducts().size());
    }

    @Transactional
    public CollectionSummaryDto updateCollection(Long id, CollectionUpsertRequest request) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collection not found."));
        collection.setName(requireText(request.getName(), "Collection name is required."));
        collection.setDescription(blankToNull(request.getDescription()));
        collection.setImageUrl(blankToNull(request.getImageUrl()));
        assignProducts(collection, request.getProductIds());
        Collection saved = collectionRepository.save(collection);
        return new CollectionSummaryDto(saved.getId(), saved.getName(), saved.getDescription(), saved.getImageUrl(), saved.getProducts().size());
    }

    public void deleteCollection(Long id) {
        if (!collectionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Collection not found.");
        }
        collectionRepository.deleteById(id);
    }

    private void assignProducts(Collection collection, List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            collection.setProducts(new java.util.ArrayList<>());
            return;
        }
        List<Product> products = productRepository.findByIdIn(productIds);
        collection.setProducts(products);
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
}
