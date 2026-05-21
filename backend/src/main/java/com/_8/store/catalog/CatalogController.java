package com._8.store.catalog;

import com._8.store.dto.CategoryDto;
import com._8.store.dto.CollectionDetailDto;
import com._8.store.dto.CollectionSummaryDto;
import com._8.store.dto.CommentResponse;
import com._8.store.dto.ProductDto;
import com._8.store.service.CommentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;
    private final CommentService commentService;

    public CatalogController(CatalogService catalogService, CommentService commentService) {
        this.catalogService = catalogService;
        this.commentService = commentService;
    }

    @GetMapping("/products")
    public List<ProductDto> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort
    ) {
        return catalogService.getAllProducts(category, sort);
    }

    @GetMapping("/products/limited-editions")
    public List<ProductDto> getLimitedEditions(
            @RequestParam(required = false) String sort
    ) {
        return catalogService.getLimitedEditionProducts(sort);
    }

    @GetMapping("/products/{id}")
    public ProductDto getProductById(@PathVariable Long id) {
        return catalogService.getProductById(id);
    }

    @GetMapping("/products/{id}/comments")
    public List<CommentResponse> getApprovedComments(@PathVariable Long id) {
        return commentService.getApprovedComments(id);
    }

    @GetMapping("/categories")
    public List<CategoryDto> getCategories() {
        return catalogService.getAllCategories();
    }

    @GetMapping("/collections")
    public List<CollectionSummaryDto> getCollections() {
        return catalogService.getAllCollections();
    }

    @GetMapping("/collections/{id}")
    public CollectionDetailDto getCollectionById(@PathVariable Long id) {
        return catalogService.getCollectionById(id);
    }
}
