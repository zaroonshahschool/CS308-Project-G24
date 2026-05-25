package com._8.store.service;

import com._8.store.dto.SetBasePriceResponse;
import com._8.store.entity.Product;
import com._8.store.repository.OrderRepository;
import com._8.store.repository.ProductRepository;
import com._8.store.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SalesManagerServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private InvoicePdfService invoicePdfService;
    @Mock private EmailService emailService;

    private SalesManagerService salesManagerService;

    @BeforeEach
    void setUp() {
        salesManagerService = new SalesManagerService(
                productRepository,
                userRepository,
                orderRepository,
                invoicePdfService,
                emailService
        );
    }

    @Test
    void removeDiscount_restoresOriginalPriceAndClearsDiscountRate() {
        Product product = discountedProduct();
        given(productRepository.findById(10L)).willReturn(Optional.of(product));

        SetBasePriceResponse response = salesManagerService.removeDiscount(10L);

        assertThat(product.getPrice()).isEqualByComparingTo("100.00");
        assertThat(product.getOriginalPrice()).isEqualByComparingTo("100.00");
        assertThat(product.getDiscountRate()).isEqualByComparingTo("0.00");
        assertThat(response.sellingPrice()).isEqualByComparingTo("100.00");
        assertThat(response.discountRate()).isEqualByComparingTo("0.00");
        verify(productRepository).save(product);
    }

    @Test
    void removeDiscount_withoutActiveDiscountThrowsException() {
        Product product = discountedProduct();
        product.setDiscountRate(BigDecimal.ZERO);
        given(productRepository.findById(10L)).willReturn(Optional.of(product));

        assertThatThrownBy(() -> salesManagerService.removeDiscount(10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Product has no active discount.");
    }

    private Product discountedProduct() {
        Product product = new Product();
        product.setId(10L);
        product.setName("Discounted Book");
        product.setPrice(new BigDecimal("80.00"));
        product.setOriginalPrice(new BigDecimal("100.00"));
        product.setDiscountRate(new BigDecimal("20.00"));
        return product;
    }
}
