package com._8.store.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/sales-manager")
public class SalesManagerController {

    @GetMapping("/sales")
    public Map<String, String> sales() {
        return Map.of("message", "Sales manager placeholder endpoint.");
    }
}
