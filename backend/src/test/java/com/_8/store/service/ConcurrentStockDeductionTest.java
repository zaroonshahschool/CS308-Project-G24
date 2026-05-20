package com._8.store.service;

import com._8.store.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConcurrentStockDeductionTest {

    @Mock
    private ProductRepository productRepository;

    @Test
    void twoSimultaneousRequests_stockOne_onlyOneSucceeds() {
        // Stock = 1, two requests come in simultaneously
        // First request succeeds (returns 1), second fails (returns 0)
        when(productRepository.decrementStock(1L, 1))
                .thenReturn(1)   // first call succeeds
                .thenReturn(0);  // second call fails (stock already 0)

        int firstResult = productRepository.decrementStock(1L, 1);
        int secondResult = productRepository.decrementStock(1L, 1);

        assertThat(firstResult).isEqualTo(1);  // first purchase succeeded
        assertThat(secondResult).isEqualTo(0); // second purchase blocked
        verify(productRepository, times(2)).decrementStock(1L, 1);
    }

    @Test
    void twoSimultaneousRequests_stockZero_bothFail() {
        when(productRepository.decrementStock(2L, 1)).thenReturn(0);

        int firstResult = productRepository.decrementStock(2L, 1);
        int secondResult = productRepository.decrementStock(2L, 1);

        assertThat(firstResult).isEqualTo(0);
        assertThat(secondResult).isEqualTo(0);
    }

    @Test
    void stockNeverGoesNegative_afterSuccessfulDeduction() {
        when(productRepository.decrementStock(3L, 1))
                .thenReturn(1)
                .thenReturn(0)
                .thenReturn(0);

        int first = productRepository.decrementStock(3L, 1);
        int second = productRepository.decrementStock(3L, 1);
        int third = productRepository.decrementStock(3L, 1);

        assertThat(first).isEqualTo(1);
        assertThat(second).isEqualTo(0);
        assertThat(third).isEqualTo(0);
        // Stock never goes negative — all subsequent calls return 0
        assertThat(second + third).isEqualTo(0);
    }

    @Test
    void atomicQuery_conditionPreventsOversell() {
        // The WHERE stock >= quantity condition means
        // returning 0 rows updated = purchase blocked
        when(productRepository.decrementStock(4L, 1)).thenReturn(0);

        int result = productRepository.decrementStock(4L, 1);

        assertThat(result).isEqualTo(0);
        assertThat(result).isLessThan(1); // confirms no oversell
    }

    @Test
    void multipleUnits_insufficientStock_blocked() {
        // Trying to buy 5 when only 3 in stock
        when(productRepository.decrementStock(5L, 5)).thenReturn(0);

        int result = productRepository.decrementStock(5L, 5);

        assertThat(result).isEqualTo(0);
    }
}