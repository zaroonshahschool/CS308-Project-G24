package com._8.store.service;

import com._8.store.entity.OrderItem;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class RefundServiceTest {

    private final RefundService refundService = new RefundService();

    @Test
    void calculateRefundTotal_usesPurchasedPriceInsteadOfCurrentPrice() {
        OrderItem item = new OrderItem();
        item.setPurchasedPrice(new BigDecimal("18.50"));
        item.setUnitPrice(new BigDecimal("25.00"));
        item.setQuantity(3);

        BigDecimal refundTotal = refundService.calculateRefundTotal(item);

        assertThat(refundTotal).isEqualByComparingTo(new BigDecimal("55.50"));
    }

    @Test
    void calculateRefundTotal_fallsBackToUnitPriceForLegacyOrders() {
        OrderItem item = new OrderItem();
        item.setUnitPrice(new BigDecimal("12.00"));
        item.setQuantity(2);

        BigDecimal refundTotal = refundService.calculateRefundTotal(item);

        assertThat(refundTotal).isEqualByComparingTo(new BigDecimal("24.00"));
    }
}
