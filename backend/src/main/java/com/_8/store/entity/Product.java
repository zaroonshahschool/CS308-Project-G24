package com._8.store.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 150)
    private String author;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_rate", precision = 5, scale = 2)
    private BigDecimal discountRate;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 100)
    private String model;

    @Column(name = "serial_number", length = 150)
    private String serialNumber;

    @Column(name = "warranty_status", length = 255)
    private String warrantyStatus;

    @Column(length = 255)
    private String distributor;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "editor_choice", nullable = false)
    private boolean editorChoice;

    @Column(name = "new_arrival", nullable = false)
    private boolean newArrival;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public Product() {
    }

    public Product(
            String name,
            String author,
            String description,
            BigDecimal price,
            BigDecimal costPrice,
            Integer stock,
            String imageUrl,
            String model,
            String serialNumber,
            String warrantyStatus,
            String distributor,
            boolean featured,
            boolean editorChoice,
            boolean newArrival,
            LocalDateTime createdAt,
            Category category
    ) {
        this.name = name;
        this.author = author;
        this.description = description;
        this.price = price;
        this.costPrice = costPrice;
        this.originalPrice = price;
        this.discountRate = BigDecimal.ZERO;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.model = model;
        this.serialNumber = serialNumber;
        this.warrantyStatus = warrantyStatus;
        this.distributor = distributor;
        this.featured = featured;
        this.editorChoice = editorChoice;
        this.newArrival = newArrival;
        this.createdAt = createdAt;
        this.category = category;
    }

    public Product(
            String name,
            String author,
            String description,
            BigDecimal price,
            Integer stock,
            String imageUrl,
            String model,
            String serialNumber,
            String warrantyStatus,
            String distributor,
            boolean featured,
            boolean editorChoice,
            boolean newArrival,
            LocalDateTime createdAt,
            Category category
    ) {
        this(
                name,
                author,
                description,
                price,
                price,
                stock,
                imageUrl,
                model,
                serialNumber,
                warrantyStatus,
                distributor,
                featured,
                editorChoice,
                newArrival,
                createdAt,
                category
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAuthor() {
        return author;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public BigDecimal getDiscountRate() {
        return discountRate;
    }

    public Integer getStock() {
        return stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getModel() {
        return model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getWarrantyStatus() {
        return warrantyStatus;
    }

    public String getDistributor() {
        return distributor;
    }

    public boolean isFeatured() {
        return featured;
    }

    public boolean isEditorChoice() {
        return editorChoice;
    }

    public boolean isNewArrival() {
        return newArrival;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Category getCategory() {
        return category;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public void setDiscountRate(BigDecimal discountRate) {
        this.discountRate = discountRate;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public void setWarrantyStatus(String warrantyStatus) {
        this.warrantyStatus = warrantyStatus;
    }

    public void setDistributor(String distributor) {
        this.distributor = distributor;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public void setEditorChoice(boolean editorChoice) {
        this.editorChoice = editorChoice;
    }

    public void setNewArrival(boolean newArrival) {
        this.newArrival = newArrival;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
