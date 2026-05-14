package com._8.store.service;

import com._8.store.entity.*;
import com._8.store.repository.CartItemRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
class StockConcurrencyTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private InvoicePdfService invoicePdfService;
    @Mock private EmailService emailService;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;

    @InjectMocks
    private OrderService orderService;

    private User mockUser;
    private Product mockProduct;
    private Order mockOrder;

    @BeforeEach
    void setUp() {
        mockUser = new User("John", "john@example.com", "pass", Role.CUSTOMER, "1234567890");
        mockUser.setId(1L);

        mockProduct = new Product();
        mockProduct.setId(10L);
        mockProduct.setName("Test Book");
        mockProduct.setPrice(new BigDecimal("19.99"));
        mockProduct.setCostPrice(new BigDecimal("10.00"));
        mockProduct.setStock(2);

        mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setUser(mockUser);
        mockOrder.setStatus(OrderStatus.PROCESSING);
        mockOrder.setTotalPrice(new BigDecimal("19.99"));
        mockOrder.setCreatedAt(LocalDateTime.now());

        given(securityContext.getAuthentication()).willReturn(authentication);
        given(authentication.getName()).willReturn("john@example.com");
        SecurityContextHolder.setContext(securityContext);
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
    }

    @Test
    void cancelOrder_usesLockToRestoreStock() {
        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(1);
        mockOrder.addItem(item);
        mockOrder.setStatus(OrderStatus.PROCESSING);

        given(orderRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(mockOrder));
        given(productRepository.findByIdForUpdate(10L)).willReturn(Optional.of(mockProduct));
        given(orderRepository.save(any())).willReturn(mockOrder);

        orderService.cancelOrder(1L);

        // Verify that findByIdForUpdate was called (pessimistic lock used)
        verify(productRepository).findByIdForUpdate(10L);
        assertThat(mockProduct.getStock()).isEqualTo(3);
        assertThat(mockOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void cancelOrder_multipleItems_locksEachProduct() {
        Product mockProduct2 = new Product();
        mockProduct2.setId(11L);
        mockProduct2.setName("Second Book");
        mockProduct2.setPrice(new BigDecimal("29.99"));
        mockProduct2.setStock(5);

        OrderItem item1 = new OrderItem();
        item1.setProduct(mockProduct);
        item1.setQuantity(2);

        OrderItem item2 = new OrderItem();
        item2.setProduct(mockProduct2);
        item2.setQuantity(3);

        mockOrder.addItem(item1);
        mockOrder.addItem(item2);
        mockOrder.setStatus(OrderStatus.PROCESSING);

        given(orderRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(mockOrder));
        given(productRepository.findByIdForUpdate(10L)).willReturn(Optional.of(mockProduct));
        given(productRepository.findByIdForUpdate(11L)).willReturn(Optional.of(mockProduct2));
        given(orderRepository.save(any())).willReturn(mockOrder);

        orderService.cancelOrder(1L);

        // Verify each product was locked individually
        verify(productRepository).findByIdForUpdate(10L);
        verify(productRepository).findByIdForUpdate(11L);
        assertThat(mockProduct.getStock()).isEqualTo(4);
        assertThat(mockProduct2.getStock()).isEqualTo(8);
    }

    @Test
    void returnOrderItem_usesLockToRestoreStock() {
        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(1);
        item.setReturnedAt(null);
        mockOrder.addItem(item);
        mockOrder.setStatus(OrderStatus.DELIVERED);

        given(orderRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(mockOrder));
        given(productRepository.findByIdForUpdate(10L)).willReturn(Optional.of(mockProduct));
        given(orderRepository.save(any())).willReturn(mockOrder);

        orderService.returnOrderItem(1L, 10L);

        // Verify pessimistic lock was used for stock restoration
        verify(productRepository).findByIdForUpdate(10L);
        assertThat(mockProduct.getStock()).isEqualTo(3);
    }

    @Test
    void cancelOrder_insufficientStockProduct_throwsException() {
        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(1);
        mockOrder.addItem(item);
        mockOrder.setStatus(OrderStatus.PROCESSING);

        given(orderRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(mockOrder));
        given(productRepository.findByIdForUpdate(10L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Product not found during stock restoration.");
    }

    @Test
    void returnOrderItem_alreadyReturned_throwsException() {
        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(1);
        item.setReturnedAt(LocalDateTime.now());
        mockOrder.addItem(item);
        mockOrder.setStatus(OrderStatus.DELIVERED);

        given(orderRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(mockOrder));

        assertThatThrownBy(() -> orderService.returnOrderItem(1L, 10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("This item has already been returned.");
    }
}