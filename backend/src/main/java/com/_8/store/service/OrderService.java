package com._8.store.service;

import com._8.store.dto.CreateOrderRequest;
import com._8.store.dto.OrderItemRequest;
import com._8.store.dto.OrderItemResponse;
import com._8.store.dto.OrderResponse;
import com._8.store.dto.AddressRequest;
import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com._8.store.entity.Product;
import com._8.store.entity.User;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InvoicePdfService invoicePdfService;
    private final EmailService emailService;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            InvoicePdfService invoicePdfService,
            EmailService emailService
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.invoicePdfService = invoicePdfService;
        this.emailService = emailService;
    }

    @Transactional
    public OrderResponse placeOrder(CreateOrderRequest request) {
        User user = getAuthenticatedUser();

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setTotalPrice(BigDecimal.ZERO);
        applyShippingAddress(order, request.getShippingAddress());

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setLineTotal(lineTotal);
            order.addItem(orderItem);

            product.setStock(product.getStock() - itemRequest.getQuantity());
            totalPrice = totalPrice.add(lineTotal);
        }

        order.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(order);

        byte[] invoicePdf = invoicePdfService.generateInvoicePdf(savedOrder);

        try {
            emailService.sendInvoiceEmail(user.getEmail(), user.getName(), savedOrder.getId(), invoicePdf);
        } catch (RuntimeException exception) {
            logger.warn("Invoice email could not be sent for order {}", savedOrder.getId(), exception);
        }

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCurrentUserOrders() {
        User user = getAuthenticatedUser();

        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public byte[] getInvoicePdfForCurrentUser(Long orderId) {
        User user = getAuthenticatedUser();

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));

        return invoicePdfService.generateInvoicePdf(order);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("No authenticated user found.");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user could not be found."));
    }

    private void applyShippingAddress(Order order, AddressRequest shippingAddress) {
        order.setShippingStreet(shippingAddress.getStreet());
        order.setShippingCity(shippingAddress.getCity());
        order.setShippingPostalCode(shippingAddress.getPostalCode());
        order.setShippingCountry(shippingAddress.getCountry());
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getUser().getName(),
                order.getUser().getEmail(),
                order.getCreatedAt(),
                order.getTotalPrice(),
                itemResponses
        );
    }
}
