package com._8.store.controller;

import com._8.store.dto.ApplyDiscountRequest;
import com._8.store.dto.DiscountedProductResponse;
import com._8.store.dto.InvoiceSummaryResponse;
import com._8.store.dto.OrderResponse;
import com._8.store.dto.RatingResponse;
import com._8.store.dto.SalesAnalyticsResponse;
import com._8.store.dto.SetBasePriceRequest;
import com._8.store.dto.SetBasePriceResponse;
import com._8.store.repository.RatingRepository;
import com._8.store.service.OrderService;
import com._8.store.service.SalesManagerService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/sales-manager")
public class SalesManagerController {

    private final OrderService orderService;
    private final SalesManagerService salesManagerService;
    private final RatingRepository ratingRepository;

    public SalesManagerController(OrderService orderService,
                                   SalesManagerService salesManagerService, RatingRepository ratingRepository) {
        this.orderService = orderService;
        this.salesManagerService = salesManagerService;
        this.ratingRepository = ratingRepository;
    }

    @GetMapping("/sales")
    public Map<String, String> sales() {
        return Map.of("message", "Sales manager placeholder endpoint.");
    }

    @GetMapping("/ratings")
    public ResponseEntity<List<RatingResponse>> getAllRatings() {
        List<RatingResponse> ratings = ratingRepository.findAllWithDetails()
                .stream()
                .map(RatingResponse::new)
                .toList();
        return ResponseEntity.ok(ratings);
    }

    @DeleteMapping("/ratings/{ratingId}")
    public ResponseEntity<?> deleteRating(@PathVariable Long ratingId) {
        if (!ratingRepository.existsById(ratingId)) {
            throw new IllegalArgumentException("Rating not found.");
        }
        ratingRepository.deleteById(ratingId);
        return ResponseEntity.ok(Map.of("message", "Rating deleted."));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{orderId}/advance-status")
    public ResponseEntity<OrderResponse> advanceOrderStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.advanceOrderStatus(orderId));
    }

    @PutMapping("/products/{productId}/price")
    public ResponseEntity<SetBasePriceResponse> setBasePrice(
            @PathVariable Long productId,
            @RequestBody SetBasePriceRequest request) {
        return ResponseEntity.ok(salesManagerService.setBasePrice(productId, request.basePrice()));
    }

    @PostMapping("/discounts")
    public ResponseEntity<List<DiscountedProductResponse>> applyDiscount(@Valid @RequestBody ApplyDiscountRequest request) {
        return ResponseEntity.ok(salesManagerService.applyDiscount(request.discountRate(), request.productIds()));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceSummaryResponse>> getInvoices(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(salesManagerService.getInvoices(from, to));
    }

    @GetMapping(value = "/invoices/{orderId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long orderId) {
        byte[] invoicePdf = salesManagerService.getInvoicePdf(orderId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"invoice-order-" + orderId + ".pdf\"")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.APPLICATION_PDF)
                .body(invoicePdf);
    }

    @GetMapping("/analytics")
    public ResponseEntity<SalesAnalyticsResponse> getAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(salesManagerService.getAnalytics(from, to));
    }
}
