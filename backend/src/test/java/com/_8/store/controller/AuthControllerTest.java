package com._8.store.controller;

import com._8.store.dto.AuthResponse;
import com._8.store.dto.UserResponse;
import com._8.store.entity.Role;
import com._8.store.security.CustomUserDetailsService;
import com._8.store.security.JwtService;
import com._8.store.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loginReturnsTokenPayload() throws Exception {
        given(authService.login(any())).willReturn(
                new AuthResponse("jwt-token", Role.CUSTOMER, "Customer Demo", "customer@aurelia.local")
        );

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "customer@aurelia.local",
                                  "password": "customer123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.name").value("Customer Demo"))
                .andExpect(jsonPath("$.email").value("customer@aurelia.local"));
    }

    @Test
    void registerReturnsCreatedUser() throws Exception {
        given(authService.register(any())).willReturn(
                new UserResponse(7L, "New Customer", "new@aurelia.local", Role.CUSTOMER,
                        "1234567890", null, null, null, null)
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "New Customer",
                                  "email": "new@aurelia.local",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.name").value("New Customer"))
                .andExpect(jsonPath("$.email").value("new@aurelia.local"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.taxNumber").value("1234567890"));
    }

    @Test
    void registerReturnsUniqueNonNullTaxNumber() throws Exception {
        given(authService.register(any())).willReturn(
                new UserResponse(8L, "Another Customer", "another@aurelia.local", Role.CUSTOMER,
                        "9876543210", null, null, null, null)
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Another Customer",
                                  "email": "another@aurelia.local",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.taxNumber").isNotEmpty())
                .andExpect(jsonPath("$.taxNumber").value("9876543210"));
    }

    @Test
    void registerRejectsBlankName() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "email": "new@aurelia.local",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerRejectsInvalidEmail() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "New Customer",
                                  "email": "not-an-email",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        given(authService.register(any()))
                .willThrow(new IllegalArgumentException("A user with this email already exists."));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "New Customer",
                                  "email": "existing@aurelia.local",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginRejectsInvalidPayload() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", containsString("Email must not be empty")))
                .andExpect(jsonPath("$.message", containsString("Password must not be empty")));
    }

    @Test
    void loginReturnsUnauthorizedForBadCredentials() throws Exception {
        given(authService.login(any())).willThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "customer@aurelia.local",
                                  "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }
}
