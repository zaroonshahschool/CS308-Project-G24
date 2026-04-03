package com._8.store.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/product-manager")
public class ProductManagerController {

    @GetMapping("/products")
    public Map<String, String> products() {
        return Map.of("message", "Product manager placeholder endpoint.");
    }
}
