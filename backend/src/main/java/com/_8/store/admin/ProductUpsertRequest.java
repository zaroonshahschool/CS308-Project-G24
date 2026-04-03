package com._8.store.admin;

import java.math.BigDecimal;

public class ProductUpsertRequest {
    private String name;
    private String author;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String model;
    private String serialNumber;
    private String warrantyStatus;
    private String distributor;
    private String categoryName;
    private Boolean featured;
    private Boolean editorChoice;
    private Boolean newArrival;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public String getWarrantyStatus() { return warrantyStatus; }
    public void setWarrantyStatus(String warrantyStatus) { this.warrantyStatus = warrantyStatus; }
    public String getDistributor() { return distributor; }
    public void setDistributor(String distributor) { this.distributor = distributor; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public Boolean getEditorChoice() { return editorChoice; }
    public void setEditorChoice(Boolean editorChoice) { this.editorChoice = editorChoice; }
    public Boolean getNewArrival() { return newArrival; }
    public void setNewArrival(Boolean newArrival) { this.newArrival = newArrival; }
}