package com._8.store.repository;

import com._8.store.entity.Product;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductRepositoryAtomicTest {

    @Mock
    private ProductRepository productRepository;

    @Test
    void decrementStock_sufficientStock_returnsOne() {
        when(productRepository.decrementStock(1L, 1)).thenReturn(1);
        int result = productRepository.decrementStock(1L, 1);
        assertThat(result).isEqualTo(1);
        verify(productRepository).decrementStock(1L, 1);
    }

    @Test
    void decrementStock_insufficientStock_returnsZero() {
        when(productRepository.decrementStock(2L, 10)).thenReturn(0);
        int result = productRepository.decrementStock(2L, 10);
        assertThat(result).isEqualTo(0);
        verify(productRepository).decrementStock(2L, 10);
    }

    @Test
    void decrementStock_zeroStock_returnsZero() {
        when(productRepository.decrementStock(3L, 1)).thenReturn(0);
        int result = productRepository.decrementStock(3L, 1);
        assertThat(result).isEqualTo(0);
    }

    @Test
    void decrementStock_bulkQuantity_returnsOne() {
        when(productRepository.decrementStock(4L, 5)).thenReturn(1);
        int result = productRepository.decrementStock(4L, 5);
        assertThat(result).isEqualTo(1);
    }

    @Test
    void decrementStock_exactStock_returnsOne() {
        when(productRepository.decrementStock(5L, 3)).thenReturn(1);
        int result = productRepository.decrementStock(5L, 3);
        assertThat(result).isEqualTo(1);
        verify(productRepository, times(1)).decrementStock(5L, 3);
    }
}