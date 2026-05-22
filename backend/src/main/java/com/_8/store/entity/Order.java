package com._8.store.entity;

import com._8.store.security.EncryptedStringConverter;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "shipping_street", length = 1024)
    private String shippingStreet;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "shipping_city", length = 1024)
    private String shippingCity;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "shipping_postal_code", length = 1024)
    private String shippingPostalCode;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "shipping_country", length = 1024)
    private String shippingCountry;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public String getShippingStreet() {
        return shippingStreet;
    }

    public String getShippingCity() {
        return shippingCity;
    }

    public String getShippingPostalCode() {
        return shippingPostalCode;
    }

    public String getShippingCountry() {
        return shippingCountry;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void setShippingStreet(String shippingStreet) {
        this.shippingStreet = shippingStreet;
    }

    public void setShippingCity(String shippingCity) {
        this.shippingCity = shippingCity;
    }

    public void setShippingPostalCode(String shippingPostalCode) {
        this.shippingPostalCode = shippingPostalCode;
    }

    public void setShippingCountry(String shippingCountry) {
        this.shippingCountry = shippingCountry;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
