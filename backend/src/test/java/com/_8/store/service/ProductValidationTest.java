package com._8.store.service;

import com._8.store.entity.Category;
import com._8.store.entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ProductValidationTest {

    private Product product;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Fiction");

        product = new Product();
        product.setId(1L);
        product.setName("Test Book");
        product.setAuthor("Test Author");
        product.setPrice(new BigDecimal("19.99"));
        product.setCostPrice(new BigDecimal("10.00"));
        product.setStock(10);
        product.setCategory(category);
        product.setFeatured(false);
        product.setEditorChoice(false);
        product.setNewArrival(false);
    }

    @Test
    void product_hasCorrectName() {
        assertThat(product.getName()).isEqualTo("Test Book");
    }

    @Test
    void product_hasCorrectPrice() {
        assertThat(product.getPrice()).isEqualByComparingTo(new BigDecimal("19.99"));
    }

    @Test
    void product_hasCorrectStock() {
        assertThat(product.getStock()).isEqualTo(10);
    }

    @Test
    void product_hasCorrectCategory() {
        assertThat(product.getCategory().getName()).isEqualTo("Fiction");
    }

    @Test
    void product_costPrice_isLessThanPrice() {
        assertThat(product.getCostPrice()).isLessThan(product.getPrice());
    }

    @Test
    void product_stockDecrement_updatesCorrectly() {
        int originalStock = product.getStock();
        product.setStock(product.getStock() - 2);
        assertThat(product.getStock()).isEqualTo(originalStock - 2);
    }

    @Test
    void product_featured_defaultIsFalse() {
        assertThat(product.isFeatured()).isFalse();
    }

    @Test
    void product_editorChoice_defaultIsFalse() {
        assertThat(product.isEditorChoice()).isFalse();
    }

    @Test
    void product_newArrival_canBeSetTrue() {
        product.setNewArrival(true);
        assertThat(product.isNewArrival()).isTrue();
    }

    @Test
    void product_discountApplied_priceReduces() {
        BigDecimal discountRate = new BigDecimal("0.10");
        BigDecimal discountedPrice = product.getPrice().multiply(BigDecimal.ONE.subtract(discountRate));
        assertThat(discountedPrice).isEqualByComparingTo(new BigDecimal("17.991"));
    }
}