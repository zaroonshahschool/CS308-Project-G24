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

    @Column(length = 255)
    private String publisher;

    @Column(name = "paper_type", length = 100)
    private String paperType;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(length = 100)
    private String dimensions;

    @Column(name = "publication_date", length = 50)
    private String publicationDate;

    @Column(length = 30)
    private String isbn;

    @Column(length = 100)
    private String language;

    @Column(name = "cover_type", length = 100)
    private String coverType;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "editor_choice", nullable = false)
    private boolean editorChoice;

    @Column(name = "new_arrival", nullable = false)
    private boolean newArrival;

    @Column(name = "limited_edition", nullable = false)
    private boolean limitedEdition;

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
            String publisher,
            String paperType,
            Integer pageCount,
            String dimensions,
            String publicationDate,
            String isbn,
            String language,
            String coverType,
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
        this.publisher = publisher;
        this.paperType = paperType;
        this.pageCount = pageCount;
        this.dimensions = dimensions;
        this.publicationDate = publicationDate;
        this.isbn = isbn;
        this.language = language;
        this.coverType = coverType;
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
            String publisher,
            String paperType,
            Integer pageCount,
            String dimensions,
            String publicationDate,
            String isbn,
            String language,
            String coverType,
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
                publisher,
                paperType,
                pageCount,
                dimensions,
                publicationDate,
                isbn,
                language,
                coverType,
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

    public String getPublisher() {
        return publisher;
    }

    public String getPaperType() {
        return paperType;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public String getDimensions() {
        return dimensions;
    }

    public String getPublicationDate() {
        return publicationDate;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getLanguage() {
        return language;
    }

    public String getCoverType() {
        return coverType;
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

    public boolean isLimitedEdition() {
        return limitedEdition;
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

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public void setPaperType(String paperType) {
        this.paperType = paperType;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }

    public void setPublicationDate(String publicationDate) {
        this.publicationDate = publicationDate;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public void setCoverType(String coverType) {
        this.coverType = coverType;
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

    public void setLimitedEdition(boolean limitedEdition) {
        this.limitedEdition = limitedEdition;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
