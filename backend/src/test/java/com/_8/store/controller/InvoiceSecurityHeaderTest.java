package com._8.store.controller;

import com._8.store.service.OrderService;
import com._8.store.service.SalesManagerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class InvoiceSecurityHeaderTest {

    @Mock
    private OrderService orderService;
    @Mock
    private SalesManagerService salesManagerService;

    @Test
    void customerInvoicePdfResponseDisablesBrowserAndProxyCaching() {
        given(orderService.getInvoicePdfForCurrentUser(42L)).willReturn("pdf".getBytes());
        OrderController controller = new OrderController(orderService);

        ResponseEntity<byte[]> response = controller.getInvoice(42L);

        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getHeaders().getFirst(HttpHeaders.PRAGMA)).isEqualTo("no-cache");
        assertThat(response.getHeaders().getFirst(HttpHeaders.EXPIRES)).isEqualTo("0");
    }

    @Test
    void salesManagerInvoicePdfResponseDisablesBrowserAndProxyCaching() {
        given(salesManagerService.getInvoicePdf(42L)).willReturn("pdf".getBytes());
        SalesManagerController controller = new SalesManagerController(
                orderService,
                salesManagerService
        );

        ResponseEntity<byte[]> response = controller.getInvoicePdf(42L);

        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getHeaders().getFirst(HttpHeaders.PRAGMA)).isEqualTo("no-cache");
        assertThat(response.getHeaders().getFirst(HttpHeaders.EXPIRES)).isEqualTo("0");
    }
}
