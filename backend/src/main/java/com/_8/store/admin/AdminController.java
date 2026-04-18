package com._8.store.admin;

import com._8.store.dto.CategoryDto;
import com._8.store.dto.DeliveryResponse;
import com._8.store.dto.OrderResponse;
import com._8.store.dto.ProductDto;
import com._8.store.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/product-manager", "/api/admin"})
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;

    public AdminController(AdminService adminService, OrderService orderService) {
        this.adminService = adminService;
        this.orderService = orderService;
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto createProduct(@RequestBody ProductUpsertRequest request) {
        return adminService.createProduct(request);
    }

    @PutMapping("/products/{id}")
    public ProductDto updateProduct(@PathVariable Long id, @RequestBody ProductUpsertRequest request) {
        return adminService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDto createCategory(@RequestBody CategoryCreateRequest request) {
        return adminService.createCategory(request);
    }

    @GetMapping("/deliveries")
    public ResponseEntity<List<DeliveryResponse>> getDeliveries() {
        return ResponseEntity.ok(adminService.getAllDeliveries());
    }

    @PutMapping("/deliveries/{orderId}/advance-status")
    public ResponseEntity<OrderResponse> advanceDeliveryStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.advanceOrderStatus(orderId));
    }
}
