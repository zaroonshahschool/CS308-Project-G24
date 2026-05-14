package com._8.store.service;

import com._8.store.dto.CreateOrderRequest;
import com._8.store.dto.OrderItemRequest;
import com._8.store.dto.OrderItemResponse;
import com._8.store.dto.OrderResponse;
import com._8.store.dto.AddressRequest;
import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com._8.store.entity.OrderStatus;
import com._8.store.entity.Product;
import com._8.store.entity.User;
import com._8.store.repository.CartItemRepository;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InvoicePdfService invoicePdfService;
    private final EmailService emailService;
    private final CartItemRepository cartItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            InvoicePdfService invoicePdfService,
            EmailService emailService,
            CartItemRepository cartItemRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.invoicePdfService = invoicePdfService;
        this.emailService = emailService;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    public OrderResponse placeOrder(CreateOrderRequest request) {
        User user = getAuthenticatedUser();

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(LocalDateTime.now());
        order.setTotalPrice(BigDecimal.ZERO);
        applyShippingAddress(order, request.getShippingAddress());
        order.setStatus(OrderStatus.PROCESSING);

        BigDecimal totalPrice = BigDecimal.ZERO;

        // Sort by productId to ensure consistent lock acquisition order and prevent deadlocks
        // when multiple transactions lock multiple products simultaneously.
        List<OrderItemRequest> requestedItems = request.getItems()
                .stream()
                .sorted(Comparator.comparing(OrderItemRequest::getProductId))
                .toList();

        for (OrderItemRequest itemRequest : requestedItems) {
            Product product = findProductForCheckout(itemRequest.getProductId());

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setUnitCost(product.getCostPrice() != null ? product.getCostPrice() : product.getPrice());
            orderItem.setLineTotal(lineTotal);
            order.addItem(orderItem);

            product.setStock(product.getStock() - itemRequest.getQuantity());
            totalPrice = totalPrice.add(lineTotal);
        }

        order.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(order);
        cartItemRepository.deleteByUser_Id(user.getId());

        byte[] invoicePdf = invoicePdfService.generateInvoicePdf(savedOrder);

        try {
            emailService.sendInvoiceEmail(user.getEmail(), user.getName(), savedOrder.getId(), invoicePdf);
        } catch (RuntimeException exception) {
            logger.warn("Invoice email could not be sent for order {}", savedOrder.getId(), exception);
        }

        return mapToResponse(savedOrder);
    }

    private Product findProductForCheckout(Long productId) {
        try {
            return productRepository.findByIdForUpdate(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        } catch (ConcurrencyFailureException exception) {
            throw new IllegalArgumentException("Stock is being updated by another checkout. Please refresh your cart and try again.", exception);
        }
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
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        User user = getAuthenticatedUser();

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));

        if (getOrderStatus(order) != OrderStatus.PROCESSING) {
            throw new IllegalArgumentException("Only processing orders can be cancelled.");
        }

        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found during stock restoration."));
            product.setStock(product.getStock() + item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse returnOrderItem(Long orderId, Long productId) {
        User user = getAuthenticatedUser();

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));

        OrderStatus currentStatus = getOrderStatus(order);
        if (currentStatus != OrderStatus.DELIVERED && currentStatus != OrderStatus.PARTIALLY_RETURNED) {
            throw new IllegalArgumentException("Items can only be returned from delivered orders.");
        }

        if (Duration.between(order.getCreatedAt(), LocalDateTime.now()).toDays() > 30) {
            throw new IllegalArgumentException("Items can only be returned within 30 days.");
        }

        OrderItem orderItem = order.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Order item not found."));

        if (orderItem.getReturnedAt() != null) {
            throw new IllegalArgumentException("This item has already been returned.");
        }

        orderItem.setReturnedAt(LocalDateTime.now());
        Product product = productRepository.findByIdForUpdate(orderItem.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found during stock restoration."));
        product.setStock(product.getStock() + orderItem.getQuantity());

        boolean allReturned = order.getItems().stream().allMatch(item -> item.getReturnedAt() != null);
        order.setStatus(allReturned ? OrderStatus.RETURNED : OrderStatus.PARTIALLY_RETURNED);

        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse advanceOrderStatus(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));

        OrderStatus nextStatus = switch (getOrderStatus(order)) {
            case PROCESSING -> OrderStatus.IN_TRANSIT;
            case IN_TRANSIT -> OrderStatus.DELIVERED;
            default -> throw new IllegalArgumentException("This order cannot be advanced further.");
        };

        order.setStatus(nextStatus);
        return mapToResponse(orderRepository.save(order));
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
                        item.getLineTotal(),
                        item.getReturnedAt()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getUser().getName(),
                order.getUser().getEmail(),
                order.getCreatedAt(),
                order.getTotalPrice(),
                getOrderStatus(order).name(),
                itemResponses
        );
    }

    private OrderStatus getOrderStatus(Order order) {
        return order.getStatus() != null ? order.getStatus() : OrderStatus.PROCESSING;
    }
}
