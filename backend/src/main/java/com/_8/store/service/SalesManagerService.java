package com._8.store.service;

import com._8.store.dto.AnalyticsPointResponse;
import com._8.store.dto.DiscountedProductResponse;
import com._8.store.dto.InvoiceSummaryResponse;
import com._8.store.dto.SalesAnalyticsResponse;
import com._8.store.dto.SetBasePriceResponse;
import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com._8.store.entity.OrderStatus;
import com._8.store.entity.Product;
import com._8.store.entity.User;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SalesManagerService {

    private static final Logger logger = LoggerFactory.getLogger(SalesManagerService.class);

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final InvoicePdfService invoicePdfService;
    private final EmailService emailService;

    public SalesManagerService(
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            InvoicePdfService invoicePdfService,
            EmailService emailService
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.invoicePdfService = invoicePdfService;
        this.emailService = emailService;
    }

    @Transactional
    public List<DiscountedProductResponse> applyDiscount(BigDecimal discountRate, List<Long> productIds) {
        if (discountRate == null || discountRate.signum() <= 0 || discountRate.compareTo(new BigDecimal("100")) >= 0) {
            throw new IllegalArgumentException("Discount rate must be between 0 and 100.");
        }
        if (productIds == null || productIds.isEmpty()) {
            throw new IllegalArgumentException("At least one product must be selected.");
        }

        List<Product> products = productRepository.findByIdIn(productIds);
        if (products.isEmpty()) {
            throw new IllegalArgumentException("No valid products were selected.");
        }

        List<DiscountedProductResponse> responses = new ArrayList<>();

        for (Product product : products) {
            BigDecimal previousPrice = product.getPrice();
            BigDecimal newPrice = previousPrice
                    .multiply(BigDecimal.ONE.subtract(discountRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)))
                    .setScale(2, RoundingMode.HALF_UP);

            product.setOriginalPrice(previousPrice);
            product.setDiscountRate(discountRate.setScale(2, RoundingMode.HALF_UP));
            product.setPrice(newPrice);

            List<User> usersToNotify = userRepository.findDistinctByWishlistProducts_Id(product.getId());
            int notifiedUsers = 0;

            for (User user : usersToNotify) {
                try {
                    emailService.sendDiscountEmail(
                            user.getEmail(),
                            user.getName(),
                            product.getName(),
                            discountRate.setScale(2, RoundingMode.HALF_UP).toPlainString(),
                            newPrice.setScale(2, RoundingMode.HALF_UP).toPlainString()
                    );
                    notifiedUsers++;
                } catch (RuntimeException exception) {
                    logger.warn("Discount email could not be sent to {} for product {}", user.getEmail(), product.getId(), exception);
                }
            }

            responses.add(new DiscountedProductResponse(
                    product.getId(),
                    product.getName(),
                    previousPrice.setScale(2, RoundingMode.HALF_UP),
                    newPrice,
                    discountRate.setScale(2, RoundingMode.HALF_UP),
                    notifiedUsers
            ));
        }

        productRepository.saveAll(products);
        return responses;
    }

    @Transactional
    public SetBasePriceResponse setBasePrice(Long productId, BigDecimal basePrice) {
        if (basePrice == null || basePrice.signum() <= 0) {
            throw new IllegalArgumentException("Base price must be greater than zero.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        BigDecimal roundedBase = basePrice.setScale(2, RoundingMode.HALF_UP);
        product.setOriginalPrice(roundedBase);

        BigDecimal discountRate = product.getDiscountRate();
        BigDecimal sellingPrice;
        if (discountRate != null && discountRate.signum() > 0) {
            sellingPrice = roundedBase
                    .multiply(BigDecimal.ONE.subtract(discountRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            sellingPrice = roundedBase;
            product.setDiscountRate(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }

        product.setPrice(sellingPrice);
        productRepository.save(product);

        BigDecimal effectiveRate = (discountRate != null ? discountRate : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        return new SetBasePriceResponse(product.getId(), product.getName(), roundedBase, sellingPrice, effectiveRate);
    }

    @Transactional
    public SetBasePriceResponse removeDiscount(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        BigDecimal discountRate = product.getDiscountRate();
        if (discountRate == null || discountRate.signum() <= 0) {
            throw new IllegalArgumentException("Product has no active discount.");
        }

        BigDecimal basePrice = product.getOriginalPrice() != null && product.getOriginalPrice().signum() > 0
                ? product.getOriginalPrice()
                : product.getPrice();
        BigDecimal roundedBase = basePrice.setScale(2, RoundingMode.HALF_UP);
        BigDecimal zeroRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        product.setOriginalPrice(roundedBase);
        product.setPrice(roundedBase);
        product.setDiscountRate(zeroRate);
        productRepository.save(product);

        return new SetBasePriceResponse(product.getId(), product.getName(), roundedBase, roundedBase, zeroRate);
    }

    @Transactional(readOnly = true)
    public List<InvoiceSummaryResponse> getAllInvoices() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(order -> new InvoiceSummaryResponse(
                        order.getId(),
                        order.getUser().getName(),
                        order.getUser().getEmail(),
                        order.getCreatedAt(),
                        (order.getStatus() != null ? order.getStatus() : OrderStatus.PROCESSING).name(),
                        order.getTotalPrice()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceSummaryResponse> getInvoices(LocalDate from, LocalDate to) {
        return getOrdersBetween(from, to).stream()
                .map(order -> new InvoiceSummaryResponse(
                        order.getId(),
                        order.getUser().getName(),
                        order.getUser().getEmail(),
                        order.getCreatedAt(),
                        (order.getStatus() != null ? order.getStatus() : OrderStatus.PROCESSING).name(),
                        order.getTotalPrice()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public byte[] getInvoicePdf(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));
        return invoicePdfService.generateInvoicePdf(order);
    }

    @Transactional(readOnly = true)
    public SalesAnalyticsResponse getAnalytics(LocalDate from, LocalDate to) {
        List<Order> orders = getOrdersBetween(from, to);
        Map<LocalDate, BigDecimal> revenueByDate = new HashMap<>();
        Map<LocalDate, BigDecimal> costByDate = new HashMap<>();

        for (Order order : orders) {
            if (order.getStatus() == OrderStatus.CANCELLED) {
                continue;
            }

            LocalDate date = order.getCreatedAt().toLocalDate();
            BigDecimal orderRevenue = BigDecimal.ZERO;
            BigDecimal orderCost = BigDecimal.ZERO;

            for (OrderItem item : order.getItems()) {
                if (item.getReturnedAt() != null) {
                    continue;
                }
                orderRevenue = orderRevenue.add(item.getLineTotal());
                BigDecimal unitCost = item.getUnitCost() != null
                        ? item.getUnitCost()
                        : (item.getProduct().getCostPrice() != null ? item.getProduct().getCostPrice() : BigDecimal.ZERO);
                orderCost = orderCost.add(unitCost.multiply(BigDecimal.valueOf(item.getQuantity())));
            }

            revenueByDate.merge(date, orderRevenue, BigDecimal::add);
            costByDate.merge(date, orderCost, BigDecimal::add);
        }

        List<AnalyticsPointResponse> points = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        LocalDate cursor = from;
        while (!cursor.isAfter(to)) {
            BigDecimal revenue = revenueByDate.getOrDefault(cursor, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal cost = costByDate.getOrDefault(cursor, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            BigDecimal profit = revenue.subtract(cost).setScale(2, RoundingMode.HALF_UP);
            points.add(new AnalyticsPointResponse(cursor, revenue, cost, profit));
            totalRevenue = totalRevenue.add(revenue);
            totalCost = totalCost.add(cost);
            cursor = cursor.plusDays(1);
        }

        return new SalesAnalyticsResponse(
                totalRevenue.setScale(2, RoundingMode.HALF_UP),
                totalCost.setScale(2, RoundingMode.HALF_UP),
                totalRevenue.subtract(totalCost).setScale(2, RoundingMode.HALF_UP),
                points
        );
    }

    private List<Order> getOrdersBetween(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("Both from and to dates are required.");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("The end date cannot be before the start date.");
        }

        return orderRepository.findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                from.atStartOfDay(),
                to.atTime(LocalTime.MAX)
        );
    }
}
