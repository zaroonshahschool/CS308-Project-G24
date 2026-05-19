package com._8.store.service;

import com._8.store.dto.OrderResponse;
import com._8.store.entity.*;
import com._8.store.repository.CartItemRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
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

import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
class OrderStatusTest {

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
        mockProduct.setStock(5);

        mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setUser(mockUser);
        mockOrder.setStatus(OrderStatus.PROCESSING);
        mockOrder.setTotalPrice(new BigDecimal("19.99"));
        mockOrder.setCreatedAt(LocalDateTime.now());

        given(securityContext.getAuthentication()).willReturn(authentication);
        given(authentication.getName()).willReturn("john@example.com");
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void advanceOrderStatus_fromProcessing_toInTransit() {
        mockOrder.setStatus(OrderStatus.PROCESSING);
        given(orderRepository.findById(1L)).willReturn(Optional.of(mockOrder));
        given(orderRepository.save(any())).willReturn(mockOrder);

        OrderResponse result = orderService.advanceOrderStatus(1L);

        assertThat(mockOrder.getStatus()).isEqualTo(OrderStatus.IN_TRANSIT);
    }

    @Test
    void advanceOrderStatus_fromInTransit_toDelivered() {
        mockOrder.setStatus(OrderStatus.IN_TRANSIT);
        given(orderRepository.findById(1L)).willReturn(Optional.of(mockOrder));
        given(orderRepository.save(any())).willReturn(mockOrder);

        OrderResponse result = orderService.advanceOrderStatus(1L);

        assertThat(mockOrder.getStatus()).isEqualTo(OrderStatus.DELIVERED);
    }

    @Test
    void advanceOrderStatus_fromDelivered_throwsException() {
        mockOrder.setStatus(OrderStatus.DELIVERED);
        given(orderRepository.findById(1L)).willReturn(Optional.of(mockOrder));

        assertThatThrownBy(() -> orderService.advanceOrderStatus(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("This order cannot be advanced further.");
    }

    @Test
    void cancelOrder_processingOrder_restoresStock() {
        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(2);
        mockOrder.addItem(item);
        mockOrder.setStatus(OrderStatus.PROCESSING);

        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(orderRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(mockOrder));
        given(productRepository.findByIdForUpdate(mockProduct.getId())).willReturn(Optional.of(mockProduct));
        given(orderRepository.save(any())).willReturn(mockOrder);

        orderService.cancelOrder(1L);

        assertThat(mockProduct.getStock()).isEqualTo(7);
        assertThat(mockOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    void cancelOrder_nonProcessingOrder_throwsException() {
        mockOrder.setStatus(OrderStatus.DELIVERED);

        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(orderRepository.findByIdAndUserId(1L, 1L)).willReturn(Optional.of(mockOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only processing orders can be cancelled.");
    }

    @Test
    void cancelOrder_orderNotFound_throwsException() {
        given(userRepository.findByEmailIgnoreCase("john@example.com")).willReturn(Optional.of(mockUser));
        given(orderRepository.findByIdAndUserId(99L, 1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.cancelOrder(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Order not found.");
    }
}
