package com._8.store.service;

import com._8.store.dto.CreateOrderRequest;
import com._8.store.dto.OrderItemRequest;
import com._8.store.dto.OrderResponse;
import com._8.store.entity.Category;
import com._8.store.entity.Order;
import com._8.store.entity.Product;
import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InvoicePdfService invoicePdfService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = new User("Jane Doe", "jane@example.com", "secret", Role.CUSTOMER, "1234567890");
        user.setId(7L);

        Category category = new Category();
        category.setId(3L);
        category.setName("Books");

        product = new Product();
        product.setId(11L);
        product.setName("Test Book");
        product.setPrice(BigDecimal.valueOf(25.00));
        product.setCostPrice(BigDecimal.valueOf(15.00));
        product.setStock(8);
        product.setCreatedAt(LocalDateTime.now());
        product.setCategory(category);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getEmail(), "secret")
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void placeOrder_sendsInvoicePdfByEmail() {
        CreateOrderRequest request = new CreateOrderRequest();
        OrderItemRequest itemRequest = new OrderItemRequest();
        itemRequest.setProductId(product.getId());
        itemRequest.setQuantity(2);
        request.setItems(List.of(itemRequest));

        byte[] pdfBytes = "invoice-pdf".getBytes();

        given(userRepository.findByEmailIgnoreCase(user.getEmail())).willReturn(Optional.of(user));
        given(productRepository.findById(product.getId())).willReturn(Optional.of(product));
        given(orderRepository.save(any(Order.class))).willAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            savedOrder.setId(42L);
            return savedOrder;
        });
        given(invoicePdfService.generateInvoicePdf(any(Order.class))).willReturn(pdfBytes);

        OrderResponse response = orderService.placeOrder(request);

        assertThat(response.getOrderId()).isEqualTo(42L);
        assertThat(response.getTotalPrice()).isEqualByComparingTo("50.00");
        assertThat(product.getStock()).isEqualTo(6);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(invoicePdfService).generateInvoicePdf(orderCaptor.capture());
        assertThat(orderCaptor.getValue().getId()).isEqualTo(42L);

        verify(emailService).sendInvoiceEmail(user.getEmail(), user.getName(), 42L, pdfBytes);
    }
}
