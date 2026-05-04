package com._8.store.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "cart_items",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_cart_items_user_product",
                columnNames = {"user_id", "product_id"}
        )
)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public CartItem() {
    }

    public CartItem(User user, Product product, Integer quantity, LocalDateTime updatedAt) {
        this.user = user;
        this.product = product;
        this.quantity = quantity;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Product getProduct() {
        return product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
