package com._8.store.service;

import com._8.store.entity.OrderItem;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class RefundService {

    public BigDecimal calculateRefundTotal(OrderItem orderItem) {
        BigDecimal purchasedPrice = orderItem.getPurchasedPrice() != null
                ? orderItem.getPurchasedPrice()
                : orderItem.getUnitPrice();

        return purchasedPrice.multiply(BigDecimal.valueOf(orderItem.getQuantity()));
    }
}
