package com._8.store.dto;

import com._8.store.entity.Role;

public class AuthResponse {

    private final String token;
    private final Role role;
    private final String name;
    private final String email;

    public AuthResponse(String token, Role role, String name, String email) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public Role getRole() {
        return role;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
