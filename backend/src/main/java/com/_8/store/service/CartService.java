package com._8.store.service;

import com._8.store.dto.CartItemResponse;
import com._8.store.dto.CartSyncItemRequest;
import com._8.store.dto.CartSyncRequest;
import com._8.store.entity.CartItem;
import com._8.store.entity.Product;
import com._8.store.entity.User;
import com._8.store.repository.CartItemRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<CartItemResponse> getCurrentUserCart() {
        User user = getAuthenticatedUser();
        List<CartItem> items = cartItemRepository.findAllByUserIdWithProducts(user.getId());
        return normalizeAndMap(items);
    }

    @Transactional
    public List<CartItemResponse> syncCurrentUserCart(CartSyncRequest request) {
        User user = getAuthenticatedUser();
        Map<Long, Integer> requestedQuantities = mergeRequestedQuantities(request.getItems());

        cartItemRepository.deleteByUser_Id(user.getId());
        cartItemRepository.flush();

        if (requestedQuantities.isEmpty()) {
            return List.of();
        }

        Map<Long, Product> productsById = productRepository.findAllById(requestedQuantities.keySet())
                .stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        LocalDateTime now = LocalDateTime.now();
        List<CartItem> itemsToSave = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : requestedQuantities.entrySet()) {
            Product product = productsById.get(entry.getKey());

            if (product == null) {
                throw new IllegalArgumentException("Product not found: " + entry.getKey());
            }

            int availableStock = getAvailableStock(product);
            int quantity = Math.min(entry.getValue(), availableStock);

            if (quantity > 0) {
                itemsToSave.add(new CartItem(user, product, quantity, now));
            }
        }

        List<CartItem> savedItems = cartItemRepository.saveAll(itemsToSave);
        return savedItems.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void clearCurrentUserCart() {
        User user = getAuthenticatedUser();
        cartItemRepository.deleteByUser_Id(user.getId());
    }

    private List<CartItemResponse> normalizeAndMap(List<CartItem> items) {
        List<CartItem> validItems = new ArrayList<>();

        for (CartItem item : items) {
            int availableStock = getAvailableStock(item.getProduct());
            int quantity = Math.min(item.getQuantity(), availableStock);

            if (quantity < 1) {
                cartItemRepository.delete(item);
                continue;
            }

            if (!item.getQuantity().equals(quantity)) {
                item.setQuantity(quantity);
                item.setUpdatedAt(LocalDateTime.now());
            }

            validItems.add(item);
        }

        return validItems.stream()
                .map(this::toResponse)
                .toList();
    }

    private Map<Long, Integer> mergeRequestedQuantities(List<CartSyncItemRequest> items) {
        Map<Long, Integer> quantitiesByProduct = new LinkedHashMap<>();

        for (CartSyncItemRequest item : items) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() < 1) {
                continue;
            }

            quantitiesByProduct.merge(item.getProductId(), item.getQuantity(), Integer::sum);
        }

        return quantitiesByProduct;
    }

    private int getAvailableStock(Product product) {
        return Math.max(0, product.getStock() == null ? 0 : product.getStock());
    }

    private CartItemResponse toResponse(CartItem item) {
        Product product = item.getProduct();

        return new CartItemResponse(
                product.getId(),
                product.getName(),
                product.getAuthor(),
                product.getDescription(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getDiscountRate(),
                product.getCostPrice(),
                getAvailableStock(product),
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
                null,
                product.getCreatedAt(),
                item.getQuantity()
        );
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("No authenticated user found.");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user could not be found."));
    }
}
