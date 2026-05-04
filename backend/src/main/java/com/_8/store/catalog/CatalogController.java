package com._8.store.catalog;

import com._8.store.dto.CategoryDto;
import com._8.store.dto.ProductDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/products")
    public List<ProductDto> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort
    ) {
        return catalogService.getAllProducts(category, sort);
    }

    @GetMapping("/products/{id}")
    public ProductDto getProductById(@PathVariable Long id) {
        return catalogService.getProductById(id);
    }

    @GetMapping("/categories")
    public List<CategoryDto> getCategories() {
        return catalogService.getAllCategories();
    }
}
