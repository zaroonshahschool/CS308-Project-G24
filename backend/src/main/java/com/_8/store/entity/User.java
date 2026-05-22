package com._8.store.entity;

import com._8.store.security.EncryptedStringConverter;
import jakarta.persistence.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Role role;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(unique = true, nullable = false, updatable = false, length = 512)
    private String taxNumber;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(length = 1024)
    private String street;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(length = 1024)
    private String city;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(length = 1024)
    private String postalCode;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(length = 1024)
    private String country;

    @ManyToMany
    @JoinTable(
            name = "wishlist_items",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> wishlistProducts = new LinkedHashSet<>();


    public User() {}


    public User(String name, String email, String password, Role role, String taxNumber) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.taxNumber = taxNumber;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public String getTaxNumber() { return taxNumber; }
    public String getStreet() { return street; }
    public String getCity() { return city; }
    public String getPostalCode() { return postalCode; }
    public String getCountry() { return country; }
    public Set<Product> getWishlistProducts() { return wishlistProducts; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(Role role) { this.role = role; }
    public void setTaxNumber(String taxNumber) { this.taxNumber = taxNumber; }
    public void setStreet(String street) { this.street = street; }
    public void setCity(String city) { this.city = city; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public void setCountry(String country) { this.country = country; }
    public void setWishlistProducts(Set<Product> wishlistProducts) { this.wishlistProducts = wishlistProducts; }
}
