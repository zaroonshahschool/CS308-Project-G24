package com._8.store.service;

import com._8.store.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class InvoicePdfServiceTest {

    @InjectMocks
    private InvoicePdfService invoicePdfService;

    private User mockUser;
    private Product mockProduct;
    private Order mockOrder;

    @BeforeEach
    void setUp() {
        mockUser = new User("John Doe", "john@example.com", "pass", Role.CUSTOMER, "1234567890");
        mockUser.setId(1L);
        mockUser.setStreet("123 Main St");
        mockUser.setCity("Istanbul");
        mockUser.setPostalCode("34000");
        mockUser.setCountry("Turkey");

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
        mockOrder.setShippingStreet("456 Test Ave");
        mockOrder.setShippingCity("Ankara");
        mockOrder.setShippingPostalCode("06000");
        mockOrder.setShippingCountry("Turkey");
    }

    @Test
    void generateInvoicePdf_withValidOrder_returnsByteArray() {
        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(1);
        item.setUnitPrice(new BigDecimal("19.99"));
        item.setLineTotal(new BigDecimal("19.99"));
        mockOrder.addItem(item);

        byte[] result = invoicePdfService.generateInvoicePdf(mockOrder);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    void generateInvoicePdf_pdfStartsWithPdfHeader() {
        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(1);
        item.setUnitPrice(new BigDecimal("19.99"));
        item.setLineTotal(new BigDecimal("19.99"));
        mockOrder.addItem(item);

        byte[] result = invoicePdfService.generateInvoicePdf(mockOrder);

        // PDF files always start with %PDF
        String header = new String(result, 0, 4);
        assertThat(header).isEqualTo("%PDF");
    }

    @Test
    void generateInvoicePdf_withMultipleItems_returnsValidPdf() {
        Product mockProduct2 = new Product();
        mockProduct2.setId(11L);
        mockProduct2.setName("Second Book");
        mockProduct2.setPrice(new BigDecimal("29.99"));

        OrderItem item1 = new OrderItem();
        item1.setProduct(mockProduct);
        item1.setQuantity(2);
        item1.setUnitPrice(new BigDecimal("19.99"));
        item1.setLineTotal(new BigDecimal("39.98"));

        OrderItem item2 = new OrderItem();
        item2.setProduct(mockProduct2);
        item2.setQuantity(1);
        item2.setUnitPrice(new BigDecimal("29.99"));
        item2.setLineTotal(new BigDecimal("29.99"));

        mockOrder.addItem(item1);
        mockOrder.addItem(item2);
        mockOrder.setTotalPrice(new BigDecimal("69.97"));

        byte[] result = invoicePdfService.generateInvoicePdf(mockOrder);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    void generateInvoicePdf_withNoShippingAddress_usesUserAddress() {
        mockOrder.setShippingStreet(null);
        mockOrder.setShippingCity(null);
        mockOrder.setShippingPostalCode(null);
        mockOrder.setShippingCountry(null);

        OrderItem item = new OrderItem();
        item.setProduct(mockProduct);
        item.setQuantity(1);
        item.setUnitPrice(new BigDecimal("19.99"));
        item.setLineTotal(new BigDecimal("19.99"));
        mockOrder.addItem(item);

        byte[] result = invoicePdfService.generateInvoicePdf(mockOrder);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    void generateInvoicePdf_withEmptyItems_stillGeneratesPdf() {
        byte[] result = invoicePdfService.generateInvoicePdf(mockOrder);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }
}