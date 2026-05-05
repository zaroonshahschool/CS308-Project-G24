package com._8.store.controller;

import com._8.store.entity.Role;
import com._8.store.entity.User;
import com._8.store.repository.UserRepository;
import com._8.store.security.CustomUserDetailsService;
import com._8.store.security.JwtService;
import com._8.store.service.CommentService;
import com._8.store.service.RatingService;
import com._8.store.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerController.class)
@AutoConfigureMockMvc(addFilters = false)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private RatingService ratingService;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private WishlistService wishlistService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User(
                "John Doe",
                "john@example.com",
                "encodedPassword",
                Role.CUSTOMER,
                "1234567890"
        );
    }

    @Test
    @WithMockUser(username = "john@example.com", roles = "CUSTOMER")
    void getProfile_withToken_returns200AndTaxNumber() throws Exception {
        given(userRepository.findByEmailIgnoreCase("john@example.com"))
                .willReturn(Optional.of(mockUser));

        mockMvc.perform(get("/api/customer/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taxNumber").value("1234567890"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    @WithMockUser(username = "john@example.com", roles = "CUSTOMER")
    void updateAddress_validRequest_returns200() throws Exception {
        given(userRepository.findByEmailIgnoreCase("john@example.com"))
                .willReturn(Optional.of(mockUser));
        given(userRepository.save(any())).willReturn(mockUser);

        mockMvc.perform(put("/api/customer/address")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "street": "123 Main St",
                                  "city": "Istanbul",
                                  "postalCode": "34000",
                                  "country": "Turkey"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Address updated successfully."));
    }

    @Test
    @WithMockUser(username = "john@example.com", roles = "CUSTOMER")
    void updateAddress_missingCity_returns400() throws Exception {
        mockMvc.perform(put("/api/customer/address")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "street": "123 Main St",
                                  "city": "",
                                  "postalCode": "34000",
                                  "country": "Turkey"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john@example.com", roles = "CUSTOMER")
    void getDashboard_withToken_returns200() throws Exception {
        mockMvc.perform(get("/api/customer/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Customer access granted."));
    }
}
