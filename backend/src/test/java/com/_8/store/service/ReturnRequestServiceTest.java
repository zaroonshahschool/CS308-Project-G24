package com._8.store.service;

import com._8.store.dto.CreateReturnRequestRequest;
import com._8.store.dto.ReturnRequestResponse;
import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com._8.store.entity.OrderStatus;
import com._8.store.entity.Product;
import com._8.store.entity.ReturnRequest;
import com._8.store.entity.ReturnRequestStatus;
import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.ReturnRequestRepository;
import com._8.store.repository.UserRepository;
import com._8.store.service.NotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class ReturnRequestServiceTest {

    @Mock private ReturnRequestRepository returnRequestRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;
    @Mock private RefundService refundService;
    @Mock private NotificationService notificationService;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;

    private ReturnRequestService returnRequestService;
    private User customer;
    private Product product;
    private Order order;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        returnRequestService = new ReturnRequestService(
                returnRequestRepository,
                orderRepository,
                userRepository,
                productRepository,
                refundService,
                notificationService
        );

        customer = new User("Ada Reader", "ada@example.com", "pass", Role.CUSTOMER, "1234567890");
        customer.setId(1L);

        product = new Product();
        product.setId(10L);
        product.setName("Returnable Book");
        product.setPrice(new BigDecimal("25.00"));

        order = new Order();
        order.setId(20L);
        order.setUser(customer);
        order.setStatus(OrderStatus.DELIVERED);
        order.setCreatedAt(LocalDateTime.now().minusDays(2));
        order.setTotalPrice(new BigDecimal("50.00"));

        orderItem = new OrderItem();
        orderItem.setId(30L);
        orderItem.setProduct(product);
        orderItem.setQuantity(2);
        orderItem.setUnitPrice(new BigDecimal("25.00"));
        orderItem.setPurchasedPrice(new BigDecimal("20.00"));
        orderItem.setLineTotal(new BigDecimal("40.00"));
        order.addItem(orderItem);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createReturnRequest_allowsNewRequestWhenPreviousRequestWasRejected() {
        authenticateCustomer();
        given(orderRepository.findByIdAndUserId(20L, 1L)).willReturn(Optional.of(order));
        given(returnRequestRepository.existsByOrderItem_IdAndStatusIn(
                eq(30L),
                eq(List.of(ReturnRequestStatus.PENDING, ReturnRequestStatus.APPROVED))
        )).willReturn(false);
        given(returnRequestRepository.save(any(ReturnRequest.class))).willAnswer(invocation -> {
            ReturnRequest savedRequest = invocation.getArgument(0);
            savedRequest.setId(99L);
            return savedRequest;
        });

        ReturnRequestResponse response = returnRequestService.createReturnRequest(createRequest("  Too small  "));

        assertThat(response.getId()).isEqualTo(99L);
        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getReason()).isEqualTo("Too small");
        verify(returnRequestRepository).save(any(ReturnRequest.class));
    }

    @Test
    void createReturnRequest_blocksPendingOrApprovedRequestForSameItem() {
        authenticateCustomer();
        given(orderRepository.findByIdAndUserId(20L, 1L)).willReturn(Optional.of(order));
        given(returnRequestRepository.existsByOrderItem_IdAndStatusIn(
                eq(30L),
                eq(List.of(ReturnRequestStatus.PENDING, ReturnRequestStatus.APPROVED))
        )).willReturn(true);

        assertThatThrownBy(() -> returnRequestService.createReturnRequest(createRequest("Does not fit")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("A return request is already active for this item.");

        verify(returnRequestRepository, never()).save(any(ReturnRequest.class));
    }

    @Test
    void rejectReturnRequest_requiresWrittenReason() {
        assertThatThrownBy(() -> returnRequestService.rejectReturnRequest(44L, "   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Rejection reason is required.");

        verifyNoInteractions(returnRequestRepository);
    }

    @Test
    void rejectReturnRequest_storesTrimmedReasonAndReturnsIt() {
        ReturnRequest pendingRequest = pendingReturnRequest();
        given(returnRequestRepository.findById(44L)).willReturn(Optional.of(pendingRequest));
        given(returnRequestRepository.save(any(ReturnRequest.class))).willAnswer(invocation -> invocation.getArgument(0));
        given(refundService.calculateRefundTotal(orderItem)).willReturn(new BigDecimal("40.00"));

        ReturnRequestResponse response = returnRequestService.rejectReturnRequest(44L, "  Product was not received back  ");

        assertThat(pendingRequest.getStatus()).isEqualTo(ReturnRequestStatus.REJECTED);
        assertThat(pendingRequest.getRejectionReason()).isEqualTo("Product was not received back");
        assertThat(pendingRequest.getResolvedAt()).isNotNull();
        assertThat(response.getStatus()).isEqualTo("REJECTED");
        assertThat(response.getRejectionReason()).isEqualTo("Product was not received back");
        assertThat(response.getRefundAmount()).isEqualByComparingTo("40.00");
    }

    private void authenticateCustomer() {
        given(securityContext.getAuthentication()).willReturn(authentication);
        given(authentication.getName()).willReturn("ada@example.com");
        SecurityContextHolder.setContext(securityContext);
        given(userRepository.findByEmailIgnoreCase("ada@example.com")).willReturn(Optional.of(customer));
    }

    private CreateReturnRequestRequest createRequest(String reason) {
        CreateReturnRequestRequest request = new CreateReturnRequestRequest();
        request.setOrderId(20L);
        request.setProductId(10L);
        request.setReason(reason);
        return request;
    }

    private ReturnRequest pendingReturnRequest() {
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setId(44L);
        returnRequest.setOrder(order);
        returnRequest.setCustomer(customer);
        returnRequest.setOrderItem(orderItem);
        returnRequest.setProduct(product);
        returnRequest.setReason("Wrong edition");
        returnRequest.setStatus(ReturnRequestStatus.PENDING);
        returnRequest.setRequestedAt(LocalDateTime.now().minusHours(4));
        return returnRequest;
    }
}
