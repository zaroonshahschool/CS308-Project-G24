package com._8.store.dto;

import com._8.store.entity.Role;

public class UserResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final Role role;
    private final String taxNumber;
    private final String street;
    private final String city;
    private final String postalCode;
    private final String country;

    public UserResponse(Long id, String name, String email, Role role,
                        String taxNumber, String street, String city,
                        String postalCode, String country) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.taxNumber = taxNumber;
        this.street = street;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getTaxNumber() { return taxNumber; }

    public String getStreet() { return street; }

    public String getCity() { return city; }

    public String getPostalCode() { return postalCode; }

    public String getCountry() { return country; }
}
