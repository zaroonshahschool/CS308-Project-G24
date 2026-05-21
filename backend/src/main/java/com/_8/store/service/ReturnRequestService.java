package com._8.store.service;

import com._8.store.dto.CreateReturnRequestRequest;
import com._8.store.dto.ReturnRequestResponse;
import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com._8.store.entity.OrderStatus;
import com._8.store.entity.Product;
import com._8.store.entity.ReturnRequest;
import com._8.store.entity.ReturnRequestStatus;
import com._8.store.entity.User;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.ReturnRequestRepository;
import com._8.store.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final RefundService refundService;

    public ReturnRequestService(
            ReturnRequestRepository returnRequestRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            RefundService refundService
    ) {
        this.returnRequestRepository = returnRequestRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.refundService = refundService;
    }

    @Transactional
    public ReturnRequestResponse createReturnRequest(CreateReturnRequestRequest request) {
        User user = getAuthenticatedUser();
        Order order = orderRepository.findByIdAndUserId(request.getOrderId(), user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));

        validateReturnWindow(order);

        OrderItem orderItem = findReturnableOrderItem(order, request.getProductId());
        if (returnRequestRepository.existsByOrderItem_Id(orderItem.getId())) {
            throw new IllegalArgumentException("A return request has already been submitted for this item.");
        }

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setCustomer(user);
        returnRequest.setOrderItem(orderItem);
        returnRequest.setProduct(orderItem.getProduct());
        returnRequest.setReason(request.getReason().trim());
        returnRequest.setStatus(ReturnRequestStatus.PENDING);
        returnRequest.setRequestedAt(LocalDateTime.now());

        return toResponse(returnRequestRepository.save(returnRequest), null);
    }

    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getPendingReturnRequests() {
        return returnRequestRepository.findAllByStatusOrderByRequestedAtDesc(ReturnRequestStatus.PENDING)
                .stream()
                .map(returnRequest -> toResponse(returnRequest, refundService.calculateRefundTotal(returnRequest.getOrderItem())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getAllReturnRequests() {
        return returnRequestRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(returnRequest -> toResponse(returnRequest, refundService.calculateRefundTotal(returnRequest.getOrderItem())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReturnRequestResponse> getCurrentUserReturnRequests() {
        User user = getAuthenticatedUser();

        return returnRequestRepository.findAllByCustomer_IdOrderByRequestedAtDesc(user.getId())
                .stream()
                .map(returnRequest -> toResponse(returnRequest, refundService.calculateRefundTotal(returnRequest.getOrderItem())))
                .toList();
    }

    @Transactional
    public ReturnRequestResponse approveReturnRequest(Long id) {
        ReturnRequest returnRequest = getPendingReturnRequest(id);
        OrderItem orderItem = returnRequest.getOrderItem();

        if (orderItem.getReturnedAt() != null) {
            throw new IllegalArgumentException("This item has already been returned.");
        }

        BigDecimal refundAmount = refundService.calculateRefundTotal(orderItem);
        Product product = productRepository.findByIdForUpdate(orderItem.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found during stock restoration."));
        product.setStock(product.getStock() + orderItem.getQuantity());

        orderItem.setReturnedAt(LocalDateTime.now());
        updateOrderReturnStatus(returnRequest.getOrder());
        returnRequest.setStatus(ReturnRequestStatus.APPROVED);
        returnRequest.setResolvedAt(LocalDateTime.now());

        return toResponse(returnRequestRepository.save(returnRequest), refundAmount);
    }

    @Transactional
    public ReturnRequestResponse rejectReturnRequest(Long id) {
        ReturnRequest returnRequest = getPendingReturnRequest(id);
        returnRequest.setStatus(ReturnRequestStatus.REJECTED);
        returnRequest.setResolvedAt(LocalDateTime.now());

        return toResponse(returnRequestRepository.save(returnRequest), refundService.calculateRefundTotal(returnRequest.getOrderItem()));
    }

    private ReturnRequest getPendingReturnRequest(Long id) {
        ReturnRequest returnRequest = returnRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Return request not found."));

        if (returnRequest.getStatus() != ReturnRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending return requests can be updated.");
        }

        return returnRequest;
    }

    private void validateReturnWindow(Order order) {
        OrderStatus currentStatus = order.getStatus() != null ? order.getStatus() : OrderStatus.PROCESSING;
        if (currentStatus != OrderStatus.DELIVERED && currentStatus != OrderStatus.PARTIALLY_RETURNED) {
            throw new IllegalArgumentException("Return requests can only be submitted for delivered orders.");
        }

        if (Duration.between(order.getCreatedAt(), LocalDateTime.now()).toDays() > 30) {
            throw new IllegalArgumentException("Return requests can only be submitted within 30 days.");
        }
    }

    private OrderItem findReturnableOrderItem(Order order, Long productId) {
        OrderItem orderItem = order.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Order item not found."));

        if (orderItem.getReturnedAt() != null) {
            throw new IllegalArgumentException("This item has already been returned.");
        }

        return orderItem;
    }

    private void updateOrderReturnStatus(Order order) {
        boolean allReturned = order.getItems().stream().allMatch(item -> item.getReturnedAt() != null);
        order.setStatus(allReturned ? OrderStatus.RETURNED : OrderStatus.PARTIALLY_RETURNED);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("No authenticated user found.");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user could not be found."));
    }

    private ReturnRequestResponse toResponse(ReturnRequest returnRequest, BigDecimal refundAmount) {
        return new ReturnRequestResponse(
                returnRequest.getId(),
                returnRequest.getOrder().getId(),
                returnRequest.getCustomer().getId(),
                returnRequest.getCustomer().getName(),
                returnRequest.getProduct().getId(),
                returnRequest.getProduct().getName(),
                returnRequest.getOrder().getCreatedAt(),
                returnRequest.getStatus().name(),
                returnRequest.getReason(),
                returnRequest.getRequestedAt(),
                returnRequest.getResolvedAt(),
                refundAmount
        );
    }
}
