package com._8.store.service;

import com._8.store.dto.CartItemResponse;
import com._8.store.dto.CartSyncItemRequest;
import com._8.store.dto.CartSyncRequest;
import com._8.store.entity.CartItem;
import com._8.store.entity.Product;
import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.CartItemRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;
import com._8.store.entity.Category;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;

    @InjectMocks
    private CartService cartService;

    private User mockUser;
    private Product mockProduct;

    @BeforeEach
    void setUp() {
        mockUser = new User("John", "john@example.com", "pass", Role.CUSTOMER, "1234567890");
        mockUser.setId(1L);

        mockProduct = new Product();
        mockProduct.setId(10L);
        mockProduct.setName("Test Book");
        mockProduct.setPrice(new BigDecimal("19.99"));
        mockProduct.setStock(5);
        Category mockCategory = new Category();
        mockCategory.setName("Fiction");
        mockProduct.setCategory(mockCategory);

        given(securityContext.getAuthentication()).willReturn(authentication);
        given(authentication.getName()).willReturn("john@example.com");
        SecurityContextHolder.setContext(securityContext);
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
    }

    @Test
    void getCurrentUserCart_returnsEmptyList_whenCartIsEmpty() {
        given(cartItemRepository.findAllByUserIdWithProducts(1L)).willReturn(List.of());

        List<CartItemResponse> result = cartService.getCurrentUserCart();

        assertThat(result).isEmpty();
    }

    @Test
    void syncCart_returnsEmpty_whenNoItemsProvided() {
        CartSyncRequest request = new CartSyncRequest();
        request.setItems(List.of());

        given(cartItemRepository.deleteByUser_Id(1L)).willReturn(1L);

        List<CartItemResponse> result = cartService.syncCurrentUserCart(request);

        assertThat(result).isEmpty();
    }

    @Test
    void syncCart_throwsException_whenProductNotFound() {
        CartSyncItemRequest itemRequest = new CartSyncItemRequest();
        itemRequest.setProductId(999L);
        itemRequest.setQuantity(1);

        CartSyncRequest request = new CartSyncRequest();
        request.setItems(List.of(itemRequest));

        given(cartItemRepository.deleteByUser_Id(1L)).willReturn(1L);
        given(productRepository.findAllById(any())).willReturn(List.of());

        assertThatThrownBy(() -> cartService.syncCurrentUserCart(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void syncCart_capsQuantityAtStock_whenRequestExceedsStock() {
        CartSyncItemRequest itemRequest = new CartSyncItemRequest();
        itemRequest.setProductId(10L);
        itemRequest.setQuantity(100);

        CartSyncRequest request = new CartSyncRequest();
        request.setItems(List.of(itemRequest));

        mockProduct.setStock(3);

        given(cartItemRepository.deleteByUser_Id(1L)).willReturn(1L);
        given(productRepository.findAllById(any())).willReturn(List.of(mockProduct));

        CartItem savedItem = new CartItem(mockUser, mockProduct, 3, LocalDateTime.now());
        given(cartItemRepository.saveAll(any())).willReturn(List.of(savedItem));

        List<CartItemResponse> result = cartService.syncCurrentUserCart(request);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).quantity()).isEqualTo(3);
    }

    @Test
    void syncCart_skipsOutOfStockProducts() {
        CartSyncItemRequest itemRequest = new CartSyncItemRequest();
        itemRequest.setProductId(10L);
        itemRequest.setQuantity(2);

        CartSyncRequest request = new CartSyncRequest();
        request.setItems(List.of(itemRequest));

        mockProduct.setStock(0);

        given(cartItemRepository.deleteByUser_Id(1L)).willReturn(1L);
        given(productRepository.findAllById(any())).willReturn(List.of(mockProduct));
        given(cartItemRepository.saveAll(any())).willReturn(List.of());

        List<CartItemResponse> result = cartService.syncCurrentUserCart(request);

        assertThat(result).isEmpty();
    }

    @Test
    void clearCart_deletesAllUserItems() {
        given(cartItemRepository.deleteByUser_Id(1L)).willReturn(2L);

        cartService.clearCurrentUserCart();

        verify(cartItemRepository).deleteByUser_Id(1L);
    }
}